import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Creates a new chat room or retrieves an existing one between two users
 * @param {string} currentUserId - Current user's ID
 * @param {string} otherUserId - Other user's ID
 * @returns {Promise<string>} - Chat room ID
 */
export const createOrGetChatRoom = async (currentUserId, otherUserId) => {
    try {
        // Check if chat room already exists
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', currentUserId)
        );

        const querySnapshot = await getDocs(q);
        let existingChatId = null;

        // Find chat room with both participants
        querySnapshot.forEach((doc) => {
            const participants = doc.data().participants;
            if (participants.includes(otherUserId)) {
                existingChatId = doc.id;
            }
        });

        if (existingChatId) {
            return existingChatId;
        }

        // Create new chat room
        const newChatRef = await addDoc(chatsRef, {
            participants: [currentUserId, otherUserId],
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            unreadCount: {
                [currentUserId]: 0,
                [otherUserId]: 0
            }
        });

        return newChatRef.id;
    } catch (error) {
        console.error('Error creating/getting chat room:', error);
        throw error;
    }
};

/**
 * Sends a message to a chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} senderId - Sender's user ID
 * @param {string} text - Message text
 * @param {Object} options - Additional options
 * @param {string} options.type - Message type ('text' or 'qr'), defaults to 'qr'
 * @returns {Promise<void>}
 */
export const sendMessage = async (chatRoomId, senderId, text, options = {}) => {
    try {
        const { type = 'qr' } = options; // Default to 'qr' for barcode messaging
        const messagesRef = collection(db, 'messages');

        // Add message to messages collection
        await addDoc(messagesRef, {
            chatRoomId,
            senderId,
            text,
            type, // Include message type
            ...(options.imageUrl && { imageUrl: options.imageUrl }), // Include image URL if present
            timestamp: serverTimestamp(),
            read: false
        });

        // Update chat room's last message
        const chatRef = doc(db, 'chats', chatRoomId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(id => id !== senderId);

            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                [`unreadCount.${otherUserId}`]: (chatData.unreadCount?.[otherUserId] || 0) + 1
            });

            // Increment messagesSent for the sender
            const userRef = doc(db, 'users', senderId);
            await updateDoc(userRef, {
                messagesSent: increment(1)
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Subscribes to real-time messages in a chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToMessages = (chatRoomId, callback) => {
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('chatRoomId', '==', chatRoomId),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(messages);
    }, (error) => {
        console.error('Error subscribing to messages:', error);
    });
};

/**
 * Gets all chat rooms for a user with real-time updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle chat rooms
 * @returns {Function} - Unsubscribe function
 */
export const getUserChats = (userId, callback) => {
    const chatsRef = collection(db, 'chats');
    // Only filter by participants (no orderBy to avoid composite index requirement)
    // Sorting is done client-side instead
    const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach((doc) => {
            chats.push({
                id: doc.id,
                ...doc.data()
            });
        });
        // Sort by lastMessageTime descending on the client
        chats.sort((a, b) => {
            const timeA = a.lastMessageTime?.toMillis?.() || 0;
            const timeB = b.lastMessageTime?.toMillis?.() || 0;
            return timeB - timeA;
        });
        callback(chats);
    }, (error) => {
        console.error('Error getting user chats:', error);
    });
};

/**
 * Marks messages as read in a chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - Current user's ID
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (chatRoomId, userId) => {
    try {
        const chatRef = doc(db, 'chats', chatRoomId);
        await updateDoc(chatRef, {
            [`unreadCount.${userId}`]: 0
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};

/**
 * Gets user data by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserData = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return {
                id: userDoc.id,
                ...userDoc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};

/**
 * Gets all users from Firestore
 * @returns {Promise<Array>} - Array of users
 */
export const getAllUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};

/**
 * Updates a user's profile data
 * @param {string} userId - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, data) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
