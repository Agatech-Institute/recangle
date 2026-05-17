import { Tabs ,Redirect} from "expo-router"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useAuth } from "../../config/authcontext.config";
import {ActivityIndicator} from "react-native";



export default function Layout(){

    const {user,isloading} = useAuth();
    
    if(isloading && !user){
        return <ActivityIndicator size={"large"} color={"black"}  style={{flex:1,justifyContent:"center",alignItems:"center"}}/>
    }
    if(!user){
        return <Redirect href="signin" />
    }

    return (
        <Tabs>
            <Tabs.Screen
                name="chats"
                options={{
                    headerShown:false,
                    title:"CHATS",
                    tabBarIcon: () => (<MaterialIcons name="wechat" size={24} color="black" />)
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    headerShown:false,
                    title:"USERS",
                    tabBarIcon: () => (<FontAwesome6 name="user-group" size={24} color="black" />)
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    headerShown:false,
                    title:"Profile",
                    tabBarIcon: () => (<SimpleLineIcons name="settings" size={24} color="black" />)
                }}
            />
        </Tabs>
    );


}