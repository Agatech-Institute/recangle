import { StyleSheet } from "react-native"
import { apptheme } from "../utilities/appcolors";
import { Dimensions } from "react-native";


const screenWidth = Dimensions.get("window")



export const appStyles = StyleSheet.create({
    wrapper:{
        flex:1,
        backgroundColor:"white"

    },
    // the view holding the input field
    inputView:{
        paddingHorizontal:16,
        padding:10
       


    },
    // border around the text input field
    inputText:{
        height:50,
        width:"100%",
        borderWidth: 1,
        borderColor: apptheme.maroon,
        borderRadius: 10,
        fontSize: 16,
        paddingHorizontal:10,
        paddingVertical:3

    },
    img2:{
        width:200,
        height:200
    },
    logoView:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        alignContent:"center"
    },
   loginBtn:{
        height: 50,
        width:"100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:10,
        backgroundColor:apptheme.yellow,
        
    },
    opc:{
        paddingHorizontal:20,
        // paddingVertical:20
        
    },
    loginText:{
        fontSize:28,
        fontWeight:"bold",
        fontFamily:"MoistlyVengionsDemo-Regular"
    },
    orSec: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    orText: {
        fontSize: 16,
        color: apptheme.red
    },
    line: {
        width: "30%",
        borderTopWidth: 1,
        borderTopColor: apptheme.red,
    },
    // signupBtn: {
    //     height: 56,
    //     display: "flex",
    //     flexDirection: "row",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     gap: 16,
    //     backgroundColor: apptheme.yellow,
    //     borderRadius: 4,
        

    // },
    googleSEC:{
        paddingHorizontal:20
    },
    ScrollViewContainer: {
        // flexGrow: 1,
        justifyContent: "space-between",
        // marginBottom: 100000,
    },
    newHere:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        
    },
    newHereText:{
        fontSize:22,
        fontFamily:"Lemoncake Homemade"
    }
})


