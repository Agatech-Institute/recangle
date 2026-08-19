import * as SecureStore from "expo-secure-store";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "../config/firebase.config";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  authErorr: null,

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
        return;
      }
      
      if (!firebaseUser.emailVerified) {
        set({ user: null, isAuthenticated: false, isInitializing: false });
        return;
      }

      // Since we passed the checks above, we know firebaseUser exists and is verified
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        console.log("jchhf", userDoc);

        const userData = userDoc.exists()
          ? { id: firebaseUser.uid, ...userDoc.data() }
          : { id: firebaseUser.uid, email: firebaseUser.email };

        set({
          user: userData,
          isAuthenticated: true,
          isInitializing: false,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        set({
          user: { id: firebaseUser.uid, email: firebaseUser.email },
          isAuthenticated: true,
          isInitializing: false,
        });
      }
    });
  },

  // setuser
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  // login
  login: async (email, password) => {
    set({
      isLoading: true,
      authErorr: null,
    });
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred.user.emailVerified) {
        await sendEmailVerification(userCred.user);
        await signOut(auth);
        throw new Error(
          "Please verify your email address before logging in. Check your inbox.",
        );
      }

      const token = await userCred.user.getIdToken();
      await SecureStore.setItemAsync("userToken", token);

      // Fetch user profile data from Firestore
      const userDocRef = doc(db, "users", userCred.user.uid);
      const userDoc = await getDoc(userDocRef);
      console.log("hii", userDoc);

      let userData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
      };

      if (userDoc.exists()) {
        userData = { ...userData, ...userDoc.data() };
      }

      set({
        user: userData,
        isAuthenticated: true,
        authErorr: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        authErorr: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // signup
  signup: async (email, password, username) => {
    set({
      isLoading: true,
      authErorr: null,
    });

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(userCred.user);
      const token = await userCred.user.getIdToken();
      await SecureStore.setItemAsync("userToken", token);

      const userData = {
        id: userCred.user.uid,
        uid: userCred.user.uid,
        email: userCred.user.email,
        profilePicture: "",
        messagesSent: 0,
        username: username,
        createdAt: new Date().toISOString(),
      };

      // Save user profile document to Firestore
      await setDoc(doc(db, "users", userCred.user.uid), userData);
      await signOut(auth);

      set({
        user: null,
        isAuthenticated: false,
        authErorr: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        authErorr: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    set({
      isLoading: false,
      authErorr: null,
    });
    try {
      await signOut(auth);
      await SecureStore.deleteItemAsync("userToken").catch(() => {});

      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      set({
        authErorr: error.message,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  // password reset
  resetpassword: async (email) => {
    set({
      isLoading: true,
      authErorr: null,
    });
    try {
      await sendPasswordResetEmail(auth, email);
      set({
        isLoading: false,
      });
    } catch (error) {
      set({
        authErorr: error.message,
        isLoading: false,
      });
      throw error;
    }
  },
}));
