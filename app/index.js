import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>landing page</Text>
      <Link href="/(tabs)/chats">GOTO HOME</Link>
         <View>
          <Link href="/signin">sign in</Link>
          </View> 
    </View>
    
  );
}