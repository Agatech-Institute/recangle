import { createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db, auth as firebaseAuth } from "../config/firebase.config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isloading, setIsLoading] = useState(true);

    useEffect(() => {
        const config = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                // Fetch user data from Firestore to get username
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: user.uid,
                            email: user.email,
                            username: userData.username || '',

                        });
                    } else {
                        setUser({ uid: user.uid, email: user.email, username: '' });
                    }
                } catch (error) {
                    Alert.alert('Error fetching user data:', error);
                    // setUser({ uid: user.uid, email: user.email, username: '' });
                }
            } else {
                setUser(null)
            }
            setIsLoading(false);
        })
        return () => config();
    }, [])

    // signUp (exposed as `signUp` to match callers)
    const signUp = async ({ email, password, username }) => {
        let user;
        try {
            const response = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            user = response.user;
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                createdAt: new Date()
            });
            return { success: true, user: user };
        } catch (error) {
            Alert.alert('Signup error', error.message);
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

    return (
        <AuthContext.Provider value={{ user, isloading, signUp, login, logout }}>
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

