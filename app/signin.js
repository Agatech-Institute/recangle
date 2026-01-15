
import { useFormik } from "formik";
import { useState } from "react";
import { signinValidation } from "../components/signupvalidation";
import { auth } from "../config/firebase.config";
import {Alert, StatusBar,Platform,TextInput ,ScrollView,Text,View,KeyboardAvoidingView,StyleSheet,Image,Dimensions,TouchableOpacity,ActivityIndicator} from "react-native";
import { useAuth } from "../config/authcontext.config";
import { useFonts } from "expo-font";
import { Link } from "expo-router";
import { appStyles } from "../utilities/mystyles";
import { getAuth,signInWithEmailAndPassword } from "firebase/auth";



const screenWidth = Dimensions.get("window")

export default function Signin(){

    const {login} = useAuth();
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [isloading,setIsLoading] = useState(false)
    const [showpassword,setShowpassword] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth,email,password);
           await login({
            uid:userCredential.user.uid,
            email:userCredential.user.email
           })
           setIsLoading(false);
        } catch (error) {
            Alert.alert("an error occured",error.message)
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
    return(
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


