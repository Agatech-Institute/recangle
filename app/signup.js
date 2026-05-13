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
import { useAuth } from "../config/authcontext.config";
import { appStyles } from "../utilities/mystyles";
import { apptheme } from "../utilities/appcolors";

export default function SignUp() {
  const { signUp } = useAuth();
  const [isLoading, setisLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showcomPassword, setShowcomPassword] = useState(false);

  const router = useRouter();

  //   password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordVisibility2 = () => {
    setShowcomPassword(!showcomPassword);
  };

  const { handleBlur, handleChange, handleSubmit, touched, errors, values } =
    useFormik({
      initialValues: {
        fullname: "",
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        phone: "",
      },
      onSubmit: async () => {
        setisLoading(true);
        try {
          // call signUp from AuthContext
          const { success, error } = await signUp(values);
          if (!success) {
            Alert.alert("Signup failed!", error || "Please try again");
            setisLoading(false);
            return;
          }
          Alert.alert(
            "Account Created",
            "A verification email has been sent to your email address. Please verify your email before logging in."
          );
          setisLoading(false);
          router.replace("/signin");
        } catch (err) {
          Alert.alert("Signup failed", "An unexpected error occurred");
          setisLoading(false);
        }
      },
      validationSchema:signupValidation
    });

  return (
    <KeyboardAvoidingView
      style={appStyles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

            {/* create account with google */}
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
            {/* OR */}
            <View style={appStyles.orSec}>
              <View style={appStyles.line}></View>
              <Text style={appStyles.orText}>OR</Text>
              <View style={appStyles.line}></View>
            </View>

            <View style={{paddingTop:10,paddingHorizontal:50,gap:10,backgroundColor:apptheme.blue,shadowColor:apptheme.teal,borderRadius:19,shadowOffset:{height:0.5,width:8},elevation:0.5}}>
                
              <View style={appStyles.inputView}>
                <TextInput
                  keyboardType="default"
                  style={appStyles.inputText}
                  placeholder=" e.g Boma Jaja"
                  placeholderTextColor="#ffffff"
                  value={values.fullname}
                  onChangeText={handleChange("fullname")}
                  onBlur={handleBlur("fullname")}
                />
              </View>
              <View style={appStyles.inputView}>
                <TextInput
                  keyboardType="default"
                  style={appStyles.inputText}
                  placeholder="e.g @bigbee"
                  placeholderTextColor="#ffffff"
                  value={values.username}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                />
                {touched.username && errors.username && (
                  <Text style={appStyles.errorMessage}>{errors.username}</Text>
                )}
              </View>
              {/* <View style={appStyles.inputView}>
                <TextInput
                  keyboardType="default"
                  style={appStyles.inputText}
                  placeholder=" e.g 09079233872"
                  placeholderTextColor="#888"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                />
                {touched.phone && errors.phone && (
                  <Text style={appStyles.errorMessage}>{errors.phone}</Text>
                )}
              </View> */}

              <View style={appStyles.inputView}>
                <TextInput
                  keyboardType="email-address"
                  style={appStyles.inputText}
                  placeholder="eg. example@gmail.com"
                  placeholderTextColor="#ffffff"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
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

              <View style={appStyles.inputView} >
                <View style={appStyles.eye}>
                  <TextInput
                    style={appStyles.inputpass}
                    placeholder="Confirm Password"
                    placeholderTextColor="#ffffff"
                    keyboardType="default"
                    secureTextEntry={!showcomPassword}
                    value={values.passwordConfirmation}
                    onChangeText={handleChange("passwordConfirmation")}
                    onBlur={handleBlur("passwordConfirmation")}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility2}>
                    <MaterialIcons
                      name={showcomPassword ? "visibility" : "visibility-off"}
                      size={24}
                      color={apptheme.teal}
                    />
                  </TouchableOpacity>

                </View>

                {errors.passwordConfirmation && touched.passwordConfirmation && (
                  <Text style={appStyles.errorMessage}>
                    {errors.passwordConfirmation}
                  </Text>
                )}
              </View>

              <View style={{ paddingHorizontal: 10,}}>
                {!errors.password && !errors.email && (
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={appStyles.loginBtn}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={apptheme.teal} />
                    ) : (
                      <Text style={appStyles.loginText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
                    {/* already have an account? */}
              <View style={appStyles.newHere}>
                <Text style={appStyles.newHereText}>Already have an account?</Text>
                <Link href="/signin " style={appStyles.newHereText}>
                  Log in
                </Link>
              </View>
            </View>

          </View>
  
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
