import { Stack } from "expo-router";
import {AuthProvider} from "../config/authcontext.config"





export default function RootLayout() {

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
        name="(tabs)"
        options={{
          headerShown:false,
          title:"tabs"
        }}
      />
     
      <Stack.Screen
        name="index"
        options={{
          title:"signin",
          headerShown:false
        }}/>
      
   
      <Stack.Screen
        name="signup"
        options={{
          title:"signup",
          headerShown:false
        }}/>
      
        <Stack.Screen
        name="(chat)/[id]"
        options={{
          title:"chat id",
          headerShown:false
        }}/>

      </Stack>
    </AuthProvider>
  )
}
