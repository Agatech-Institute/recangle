import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OptimizedQRMessageBubble from "../../components/OptimizedQRMessageBubble";
import { useAuth } from "../../config/authcontext.config";
import { apptheme } from "../../utilities/appcolors";
import {
  createOrGetChatRoom,
  getUserData,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "../../utilities/messageUtils";

const MessageBubble = memo(
  ({ message, currentUserId, onImagePress }) => {
    const isMyMessage = String(message.senderId) === String(currentUserId);

    // Debug log (remove later)
    // console.log(`Msg ${message.id} | Sender: ${message.senderId} | Me: ${currentUserId} | isMine: ${isMyMessage}`);

    // Format timestamp
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <View style={styles.bubbleContainer}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
            message.type === "image" && styles.imageBubble,
          ]}
        >
          {message.type === "image" ? (
            <TouchableOpacity
              onPress={() => onImagePress(message.imageUrl || message.text)}
            >
              <Image
                source={{ uri: message.imageUrl || message.text }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {message.text}
            </Text>
          )}
          <Text
            style={[
              styles.timestamp,
              isMyMessage && styles.myTimestamp,
              message.type === "image" && styles.imageTimestamp,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Strict memoization - only re-render if core data changes
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.timestamp === nextProps.message.timestamp &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  },
);

MessageBubble.displayName = "MessageBubble";

export default function ChatScreen() {
  const { id, username } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoomId, setChatRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const flatListRef = useRef(null);
  const router = useRouter();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!id) {
      console.warn("ChatScreen: route id is not available");
      setLoading(false);
      return;
    }

    if (!currentUser) {
      // Still waiting for authentication to complete
      setLoading(true);
      return;
    }

    let isMounted = true;

    initializeChat().then((unsubscribe) => {
      if (isMounted && unsubscribe) {
        unsubscribeRef.current = unsubscribe;
      }
    });

    return () => {
      isMounted = false;
      if (
        unsubscribeRef.current &&
        typeof unsubscribeRef.current === "function"
      ) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentUser, id]);

  const initializeChat = async () => {
    if (!currentUser) {
      console.error("Error: currentUser is null during chat initialization");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get or create chat room
      const roomId = await createOrGetChatRoom(currentUser.uid, id);
      setChatRoomId(roomId);

      // Get other user's data
      const userData = await getUserData(id);
      setOtherUser(userData);

      // Subscribe to messages
      const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
        setMessages(newMessages);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 1000);
      });

      // Mark messages as read
      await markMessagesAsRead(roomId, currentUser.uid);

      setLoading(false);

      return unsubscribe;
    } catch (error) {
      console.error("Error initializing chat:", error);
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadAndSendImage = async (uri) => {
    if (!chatRoomId || !currentUser) return;

    try {
      setUploading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      });
      formData.append("upload_preset", "ANGLEAPP");
      formData.append("cloud_name", "dc2wu6xw9");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dc2wu6xw9/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.secure_url) {
        await sendMessage(chatRoomId, currentUser.uid, "Image", {
          type: "image",
          imageUrl: data.secure_url,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error sending image:", error);
      Alert.alert("Error", "Failed to send image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    try {
      setSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need permission to save images to your gallery.",
        );
        return;
      }

      // Download file to temp location
      const filename = selectedImage.split("/").pop() || "image.jpg";
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResub = await FileSystem.downloadAsync(
        selectedImage,
        fileUri,
      );

      if (downloadResub.status === 200) {
        // Create asset and save to album
        const asset = await MediaLibrary.createAssetAsync(downloadResub.uri);
        await MediaLibrary.createAlbumAsync("Chat Images", asset, false);
        Alert.alert("Success", "Image saved to gallery");
      } else {
        throw new Error("Failed to download image");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatRoomId && currentUser) {
      const messageToSend = newMessage.trim();
      setNewMessage(""); // Clear immediately for better UX
      try {
        await sendMessage(chatRoomId, currentUser.uid, messageToSend);
      } catch (error) {
        console.error("Error sending message:", error);
        // Optional: restore text if sending failed
        // setNewMessage(messageToSend);
      }
    }
  };

  // Memoized render callback - strict prop comparison
  const renderItem = useCallback(
    ({ item }) => {
      if (!currentUser) return null;

      if (item.type === "qr") {
        return (
          <OptimizedQRMessageBubble
            message={item}
            currentUserId={currentUser.uid}
            onReveal={handleRevealQR}
          />
        );
      }
      return (
        <MessageBubble
          message={item}
          currentUserId={currentUser.uid}
          onImagePress={setSelectedImage}
        />
      );
    },
    [currentUser, currentUser?.uid],
  );

  // Memoized QR reveal handler
  const handleRevealQR = useCallback((messageId, isRevealed) => {
    console.log(`QR message ${messageId} revealed: ${isRevealed}`);
  }, []);

  // Memoized getItemLayout for constant offset calculation
  // const getItemLayout = useCallback((data, index) => ({
  //   length: 340,
  //   offset: 340 * index,
  //   index,
  // }), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 3}
      enabled={true}
    >
      <SafeAreaView
        style={[styles.container, { flex: 1 }]}
        edges={["top", "left", "right"]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
            {otherUser?.profilePicture && (
              <Image
                source={{ uri: otherUser.profilePicture }}
                style={styles.headerAvatar}
              />
            )}
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {otherUser?.username || username || "Chat"}
            </Text>
            {otherUser?.email && (
              <Text style={styles.headerSubtitle}>{otherUser.email}</Text>
            )}
          </View>
        </View>

        {/* Messages List */}
        <FlashList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          estimatedItemSize={100}
          // getItemLayout={getItemLayout}
          // initialNumToRender={7}
          // windowSize={5}
          // maxToRenderPerBatch={10}
          // updateCellsBatchingPeriod={30}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Send a message to start the conversation
              </Text>
            </View>
          )}
        />

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.iconButton}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <MaterialIcons name="image" size={28} color={apptheme.blue} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={(text) => {
              const words = text
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0);
              if (words.length <= 50) {
                setNewMessage(text);
              }
            }}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline={true}
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons
              name="send"
              size={33}
              color={newMessage.trim() ? "green" : "red"}
            />
          </TouchableOpacity>
        </View>

        {/* Full Screen Image Viewer Modal */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleSaveImage}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="file-download" size={24} color="#fff" />
                  <Text style={styles.downloadText}>Save to Gallery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: apptheme.pink,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7d0303",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  bubbleContainer: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 4,
  },
  myBubbleContainer: {
    justifyContent: "flex-end",
  },
  theirBubbleContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: apptheme.navy,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: apptheme.teal,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    color: "#e3f2fd",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: apptheme.pink,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    // maxHeight: 10,
    fontSize: 16,
    height: 50,
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageBubble: {
    padding: 6,
  },
  imageTimestamp: {
    marginTop: 2,
    marginRight: 4,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#890000",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "70%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  downloadButton: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  downloadText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});
