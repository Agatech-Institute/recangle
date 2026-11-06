import { BlurView } from "expo-blur";
import { memo, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";

/**
 * QRMessageBubble Component
 * Renders QR code messages with blur overlay and tap-to-reveal functionality
 * Memoized to prevent unnecessary re-renders during list scrolling
 */
const QRMessageBubble = memo(
  ({ message, currentUserId }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [animationValue] = useState(new Animated.Value(0));
    const isMyMessage = message.senderId === currentUserId;
    // const screenWidth = Dimensions.get('window').width;

    // Format timestamp
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Handle tap to reveal/hide
    const handleToggleReveal = () => {
      setIsRevealed(!isRevealed);
      Animated.timing(animationValue, {
        toValue: isRevealed ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    return (
      <View
        style={[
          styles.container,
          isMyMessage
            ? styles.myMessageContainer
            : styles.theirMessageContainer,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleReveal}
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
          ]}
        >
          {/* QR Code */}
          <View style={styles.qrContainer}>
            {!isRevealed ? (
              <View style={styles.qrWrapper}>
                <QRCode
                  value={message.text}
                  size={180}
                  color="orange"
                  backgroundColor="blue"
                  ecl="H" // High error correction level
                  quietZone={8}
                  onError={(error) => {
                    console.error("QR Code generation error:", error);
                  }}
                />
                {/* Blur Overlay for Incoming Messages */}
                {!isMyMessage && (
                  <BlurView intensity={60} style={styles.blurOverlay}>
                    <View style={styles.revealHint}>
                      <Text style={styles.revealHintText}>Tap to read</Text>
                    </View>
                  </BlurView>
                )}
                {/* Tap Hint for Own Messages */}
                {isMyMessage && (
                  <View style={styles.tapHintContainer}>
                    <Text style={styles.tapHintText}>Tap to read</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Revealed Message Text */
              <View style={styles.revealedTextContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.scrollContent}
                >
                  <Text
                    style={[
                      styles.revealedText,
                      isMyMessage && styles.revealedTextMy,
                    ]}
                  >
                    {message.text}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Timestamp */}
          <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
            {formatTime(message.timestamp)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    // Return true if props are equal (don't re-render), false if different (re-render)
    // Only re-render if message.id, message.text, message.timestamp, or currentUserId changes
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.timestamp === nextProps.message.timestamp &&
      prevProps.message.senderId === nextProps.message.senderId &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  },
);

QRMessageBubble.displayName = "QRMessageBubble";

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  theirMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  myMessage: {
    backgroundColor: "#2196F3",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  qrContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: 220,
  },
  qrWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
  },
  blurOverlay: {
    position: "absolute",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  revealHint: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  revealHintText: {
    fontSize: 13,
    fontWeight: "600",
    color: "green",
    textAlign: "center",
  },
  tapHintContainer: {
    position: "absolute",
    bottom: 8,
    backgroundColor: "rgba(33, 150, 243, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tapHintText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  revealedTextContainer: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 400,
    minHeight: 50, // Reduced from 200 for more natural growth
    width: 200, // Matches qrWrapper width
  },
  scrollContent: {
    flexGrow: 1,
  },
  revealedText: {
    fontSize: 18, // Increased from 16
    color: "#333",
    textAlign: "left",
    fontWeight: "500",
  },
  revealedTextMy: {
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    color: "#e3f2fd",
  },
});

export default QRMessageBubble;
