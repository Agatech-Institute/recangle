
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../config/authcontext.config";
import { auth } from "../config/firebase.config";
import { appStyles } from "../utilities/mystyles";





export default function Signin() {

    const { login, resendVerificationEmail, logout } = useAuth();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isloading, setIsLoading] = useState(false)
    const [showpassword, setShowpassword] = useState(false)
    const router = useRouter()


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                Alert.alert(
                    "Email not verified",
                    "Please verify your email address before logging in. Check your inbox for the verification link.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Resend Email",
                            onPress: async () => {
                                const result = await resendVerificationEmail();
                                if (result.success) {
                                    Alert.alert("Success", "Verification email sent!");
                                } else {
                                    Alert.alert("Error", result.error);
                                }
                            }
                        }
                    ]
                );
                await logout(); // Sign out since they are not verified
                setIsLoading(false);
                return;
            }

            await login({
                uid: user.uid,
                email: user.email
            });
            router.replace("/(tabs)/chats")
            setIsLoading(false);
        } catch (error) {
            Alert.alert("Login failed", error.message)
            setIsLoading(false);
        }
    }
    //      const [fontsLoaded] = useFonts({
    //     "Lemoncake Homemade":require("../assets/images/fonts/Lemoncake Homemade.ttf"),
    //     "MoistlyVengionsDemo-Regular":require("../assets/images/fonts/MoistlyVengionsDemo-Regular.otf"),

    //   });

    //   if (!fontsLoaded){
    //     return null
    //   };
    return (
        <KeyboardAvoidingView style={appStyles.wrapper}
            behavior={Platform.OS === "ios" ? "padding"
                : "height"
            }
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView contentContainerStyle={appStyles.ScrollViewContainer}>
                <View style={appStyles.logoView}>
                    <Image
                        source={require("../assets/images/anglelgs.png")}
                        style={appStyles.img2}
                    />
                </View>
                <View style={appStyles.googleSEC}>
                    <TouchableOpacity style={appStyles.loginBtn}>
                        <Image
                            style={{
                                width: 36,
                                height: 36,
                            }}
                            source={require("../assets/images/google.png")}></Image>
                        <Text style={appStyles.loginText}>Google</Text>
                    </TouchableOpacity>
                </View>
                <View style={appStyles.orSec}>
                    <View style={appStyles.line}></View>
                    <Text style={appStyles.orText}>OR</Text>
                    <View style={appStyles.line}></View>
                </View>
                <View >
                    <View style={appStyles.inputView} >
                        <TextInput
                            placeholderTextColor="black"
                            keyboardType="email-address"
                            style={appStyles.inputText}
                            placeholder="enter your email"
                            value={email}
                            onChangeText={setEmail}

                        />
                    </View>
                    <View style={appStyles.inputView} >
                        <TextInput
                            placeholderTextColor="black"
                            secureTextEntry={true}
                            keyboardType="default"
                            style={appStyles.inputText}
                            placeholder="password"
                            value={password}
                            onChangeText={setPassword}

                        />

                    </View>


                </View>
                <View style={appStyles.opc}>
                    <TouchableOpacity onPress={handleLogin} style={appStyles.loginBtn}>
                        {isloading ? <ActivityIndicator size="small" color="red" />
                            : <Text style={appStyles.loginText}>LOG IN</Text>}
                    </TouchableOpacity>
                </View>
                <View style={appStyles.newHere}>
                    <Link href={"/signup"}>
                        <Text style={appStyles.newHereText}>New here ?? Create account</Text>
                    </Link>
                </View>



            </ScrollView>
        </KeyboardAvoidingView>
    )
}


