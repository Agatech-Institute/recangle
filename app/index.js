import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apptheme } from "../utilities/appcolors";
import { appStyles } from "../utilities/mystyles";
import { useFormik } from "formik";
import { useAuthStore } from "@/config/useauthstore";
import { ALWAYS } from "expo-secure-store";

export default function Signin() {
 const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const resetpassword = useAuthStore((state) => state.resetpassword)
  const [showpassword, setShowpassword] = useState(false);
  const router = useRouter();

 const { handleChange, handleSubmit, touched, errors, values } =
    useFormik({
      initialValues: {
        email: "",
        password:"",
        username:""
        
      },
      onSubmit: async (values) => {
        try {
         await login(values.email,values.password)
         router.replace("/(tabs)/chats")
          }
      
        catch (error) {
          Alert.alert("Sign in error",error.message)
         
        }
      },
      
    });

    


  return (
    <KeyboardAvoidingView
      style={appStyles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
              source={require("../assets/images/google.png")}
            ></Image>
            <Text style={appStyles.loginText}>Google</Text>
          </TouchableOpacity>
        </View>
        <View style={appStyles.orSec}>
          <View style={appStyles.line}></View>
          <Text style={appStyles.orText}>OR</Text>
          <View style={appStyles.line}></View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              paddingTop: 10,
              paddingHorizontal: 50,
              gap: 10,
              backgroundColor: apptheme.blue,
              shadowColor: apptheme.teal,
              borderRadius: 19,
              shadowOffset: { height: 0.5, width: 8 },
              elevation: 0.5,
            }}
          >
            <View style={appStyles.inputView}>
              <TextInput
                placeholderTextColor="#ffffff"
                keyboardType="email-address"
                style={appStyles.inputText}
                placeholder="enter your email"
                value={values.email}
                onChangeText={handleChange("email")}
              />
            </View>
            <View style={appStyles.inputView}>
              <View style={appStyles.eye}>
                <TextInput
                  placeholderTextColor="#ffffff"
                  secureTextEntry={!showpassword}
                  keyboardType="default"
                  style={appStyles.inputpass}
                  placeholder="password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                />
                <TouchableOpacity
                  onPress={() => setShowpassword(!showpassword)}
                >
                  <MaterialIcons
                    name={showpassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={apptheme.teal}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingHorizontal: 10 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={appStyles.loginBtn}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={apptheme.teal} />
                ) : (
                  <Text style={appStyles.loginText}>LOG IN</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={appStyles.newHere}>
              <Text style={appStyles.newHereText}>New here ?? </Text>
             
              <Link href={"/signup"} style={appStyles.newHereText}>
                Create account
              </Link>
              
            </View>
             <Link href={"/passwordreset"}  style={appStyles.newHere}>
                <Text style={{}}>Forgotten passwprd? reset here</Text>
             </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
