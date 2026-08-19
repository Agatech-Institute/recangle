import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useFormik } from "formik";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signupValidation } from "../components/signupvalidation";
import { appStyles } from "../utilities/mystyles";
import { apptheme } from "../utilities/appcolors";
import {useAuthStore } from "../config/useauthstore";
import { setDoc } from "firebase/firestore";

export default function SignUp() {
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [showcomPassword, setShowcomPassword] = useState(false);

  const router = useRouter();

  // Password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordVisibility2 = () => {
    setShowcomPassword(!showcomPassword);
  };

  const { handleBlur, handleChange, handleSubmit, touched, errors, values } =
    useFormik({
      initialValues: {
        username: "",
        email: "",
        password: "",
      
      },
      validationSchema: signupValidation,
      onSubmit: async (values) => {
        try {
          await signup(values.email, values.password,values.username)
            router.replace("/")
          Alert.alert("Signup Sucessful","please verify your email to login")
        } catch (error) {
          Alert.alert("Sign up error", error.message);
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
        <View style={appStyles.inputView}>
          <Text style={appStyles.bodyText}>Create new account</Text>

          {/* Create account with google */}
          <View style={appStyles.googleSEC}>
            <TouchableOpacity style={appStyles.loginBtn}>
              <Image
                style={{
                  width: 36,
                  height: 36,
                }}
                source={require("../assets/images/google.png")}
              />
              <Text style={appStyles.loginText}>Google</Text>
            </TouchableOpacity>
          </View>
          
          {/* OR */}
          <View style={appStyles.orSec}>
            <View style={appStyles.line} />
            <Text style={appStyles.orText}>OR</Text>
            <View style={appStyles.line} />
          </View>

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
                keyboardType="default"
                style={appStyles.inputText}
                placeholder="e.g bigbee"
                placeholderTextColor="#ffffff"
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                autoCapitalize="none"
              />
              {touched.username && errors.username && (
                <Text style={appStyles.errorMessage}>{errors.username}</Text>
              )}
            </View>

            <View style={appStyles.inputView}>
              <TextInput
                keyboardType="email-address"
                style={appStyles.inputText}
                placeholder="e.g example@gmail.com"
                placeholderTextColor="#ffffff"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={appStyles.errorMessage}>{errors.email}</Text>
              )}
            </View>

            <View style={appStyles.inputView}>
              <View style={appStyles.eye}>
                <TextInput
                  secureTextEntry={!showPassword}
                  keyboardType="default"
                  placeholder=" Create Password"
                  placeholderTextColor="#ffffff"
                  style={appStyles.inputpass}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={apptheme.teal}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && touched.password && (
                <Text style={appStyles.errorMessage}>{errors.password}</Text>
              )}
            </View>

            {/* Submit Button always rendered to preserve hook tree stability */}
            <View style={{ paddingHorizontal: 10 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={appStyles.loginBtn}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color={apptheme.teal} />
                ) : (
                  <Text style={appStyles.loginText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Already have an account? */}
            <View style={appStyles.newHere}>
              <Text style={appStyles.newHereText}>Already have an account?</Text>
              <Link href="/signin" style={appStyles.newHereText}>
                {" "}Log in
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}