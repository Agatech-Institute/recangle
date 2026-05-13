import { createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where,onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db, auth as firebaseAuth } from "../config/firebase.config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isloading, setIsLoading] = useState(true);

    useEffect(() => {
        let unsubscribeUser;

        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                // Subscribe to user data in Firestore
                const userDocRef = doc(db, 'users', user.uid);

                unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        setUser({
                            uid: user.uid,
                            email: user.email,
                            emailVerified: user.emailVerified,
                            ...userData,
                            createdAt: userData.createdAt?.toDate?.() || new Date(),
                        });
                    } else {
                        // Fallback if doc doesn't exist yet but auth does
                        setUser({
                            uid: user.uid,
                            email: user.email,
                            emailVerified: user.emailVerified,
                        });
                    }
                    setIsLoading(false);
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    setIsLoading(false);
                });

            } else {
                setUser(null);
                setIsLoading(false);
                if (unsubscribeUser) {
                    unsubscribeUser();
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) {
                unsubscribeUser();
            }
        };
    }, []);

    // signUp (exposed as `signUp` to match callers)
    const signUp = async ({ email, password, username }) => {
        let user;
        try {
            // Check if username is already taken
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return { success: false, error: "Username already taken." };
            }

            const response = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            user = response.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                messagesSent: 0,
                createdAt: new Date()
            });

            // Send verification email
            await sendEmailVerification(user);

            return { success: true, user: user };
        } catch (error) {
            // Alert.alert('Signup error', error.message); // Let the component handle the alert
            return { success: false, error: error.message };
        }
    };

    // login
    const login = async (userData) => {
        setUser(userData)
    }

    const logout = async () => {
        try {
            await firebaseSignOut(firebaseAuth)
        } catch (error) {
            Alert.alert("an error occured", "signout failed")
        }
    }

    const resendVerificationEmail = async () => {
        if (firebaseAuth.currentUser) {
            try {
                await sendEmailVerification(firebaseAuth.currentUser);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: "No user logged in" };
    };

    return (
        <AuthContext.Provider value={{ user, isloading, signUp, login, logout, resendVerificationEmail }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context;
}

export default AuthContext;

