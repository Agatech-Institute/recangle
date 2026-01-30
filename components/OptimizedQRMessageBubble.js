import { BlurView } from 'expo-blur';
import { memo, useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apptheme } from '../utilities/appcolors';

/**
 * Optimized QRMessageBubble using base64 image instead of live SVG rendering
 * Memoized with strict prop comparison for maximum performance
 */
// const screenWidth = Dimensions.get('window').width

const OptimizedQRMessageBubble = memo(
  ({ message, currentUserId, onReveal }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const isMyMessage = message.senderId === currentUserId;

    // Format timestamp
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Memoized reveal handler
    const handleToggleReveal = useCallback(() => {
      setIsRevealed(!isRevealed);
      if (onReveal) {
        onReveal(message.id, !isRevealed);
      }
    }, [isRevealed, message.id, onReveal]);

    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleReveal}
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
          ]}
        >
          {!isRevealed ? (
            // QR Code Image (base64)
            <View style={styles.qrContainer}>
              {message.qrImage ? (
                <Image
                  source={{ uri: message.qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : null}

              {/* Blur Overlay for Incoming Messages */}
              {!isMyMessage && (
                <BlurView intensity={60} style={styles.blurOverlay}>
                  <View style={styles.revealHint}>
                    <Text style={styles.revealHintText}>Tap to reveal</Text>
                  </View>
                </BlurView>
              )}

              {/* Tap Hint for Own Messages */}
              {isMyMessage && (
                <View style={styles.tapHintContainer}>
                  <Text style={styles.tapHintText}>Tap to show text</Text>
                </View>
              )}
            </View>
          ) : (
            // Revealed Message Text
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

          {/* Timestamp */}
          <Text
            style={[
              styles.timestamp,
              isMyMessage && styles.myTimestamp,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Strict equality check - only re-render if these specific props change
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.qrImage === nextProps.message.qrImage &&
      prevProps.message.timestamp === nextProps.message.timestamp &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  }
);

OptimizedQRMessageBubble.displayName = 'OptimizedQRMessageBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
    minHeight: 240,
    width: '100%',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'flex-start', // Default
  },

  myMessage: {
    backgroundColor: apptheme.navy,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: apptheme.teal,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
    position: 'relative',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  blurOverlay: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  revealHint: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    color: "white"
  },
  revealHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  tapHintContainer: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tapHintText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  revealedTextContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 200, // Matches qrContainer width
    maxHeight: 370,
    minHeight: 50, // Reduced from 200 for more natural growth
  },
  scrollContent: {
    flexGrow: 1,
  },
  revealedText: {
    fontSize: 18, // Increased from 14
    color: '#333',
    textAlign: 'left',
    fontWeight: '500',
    // textAlign: "justify"
  },
  revealedTextMy: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: '#e3f2fd',
  },
});

export default OptimizedQRMessageBubble;
