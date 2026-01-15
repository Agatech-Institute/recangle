import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptimizedQRMessageBubble from '../../components/OptimizedQRMessageBubble';
import { useAuth } from '../../config/authcontext.config';
import { createOrGetChatRoom, getUserData, markMessagesAsRead, sendMessage, subscribeToMessages } from '../../utilities/messageUtils';

const MessageBubble = memo(({ message, currentUserId }) => {
  const isMyMessage = message.senderId === currentUserId;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.messageBubble,
      isMyMessage ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={[
        styles.messageText,
        isMyMessage && styles.myMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.timestamp,
        isMyMessage && styles.myTimestamp
      ]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Strict memoization - only re-render if core data changes
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

MessageBubble.displayName = 'MessageBubble';

export default function ChatScreen() {
  const { id, username } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const { user: currentUser } = useAuth();
  const flatListRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || !id) return;

    initializeChat();

    return () => {
      // Cleanup will be handled by unsubscribe
    };
  }, [currentUser, id]);

  const initializeChat = async () => {
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
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatRoomId) {
      const messageToSend = newMessage.trim();
      setNewMessage(''); // Clear immediately for better UX
      try {
        await sendMessage(chatRoomId, currentUser.uid, messageToSend);
      } catch (error) {
        console.error('Error sending message:', error);
        // Optional: restore text if sending failed
        // setNewMessage(messageToSend);
      }
    }
  };

  // Memoized render callback - strict prop comparison
  const renderItem = useCallback(({ item }) => {
    if (item.type === 'qr') {
      return (
        <OptimizedQRMessageBubble
          message={item}
          currentUserId={currentUser.uid}
          onReveal={handleRevealQR}
        />
      );
    }
    return <MessageBubble message={item} currentUserId={currentUser.uid} />;
  }, [currentUser.uid]);

  // Memoized QR reveal handler
  const handleRevealQR = useCallback((messageId, isRevealed) => {
    console.log(`QR message ${messageId} revealed: ${isRevealed}`);
  }, []);

  // Memoized getItemLayout for constant offset calculation
  const getItemLayout = useCallback((data, index) => ({
    length: 340,
    offset: 340 * index,
    index,
  }), []);

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 5}
      enabled={true}
    >
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {otherUser?.username || username || 'Chat'}
            </Text>
            {otherUser?.email && (
              <Text style={styles.headerSubtitle}>{otherUser.email}</Text>
            )}
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          // getItemLayout={getItemLayout}
          // initialNumToRender={7}
          // windowSize={5}
          // maxToRenderPerBatch={10}
          // updateCellsBatchingPeriod={30}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
            </View>
          )}
        />

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={(text) => {
              const words = text.trim().split(/\s+/).filter(word => word.length > 0);
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
              !newMessage.trim() && styles.sendButtonDisabled
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7d0303',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: 'red',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    color: "red"
  },
  theirMessage: {
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    color: "red"
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  myMessageText: {
    color: "red",
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: '#e3f2fd',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 7,
    backgroundColor: 'orange',
    alignItems: 'center',
    // borderTopWidth: 1,
    // borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    // paddingHorizontal: 16,
    // paddingVertical: 8,
    // marginRight: 8,
    // maxHeight: 10,
    fontSize: 16,
    height: 50
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#890000',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});