import { Dimensions, StyleSheet } from "react-native";
import { apptheme } from "../utilities/appcolors";


const screenWidth = Dimensions.get("window")



export const appStyles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "white",
        marginBottom:40,
        marginTop:40

    },
    errorMessage: {
        color: "white",
        fontSize: 12,
       
    },
    // the view holding the input field
    inputView: {
        paddingHorizontal: 16,
        padding: 5,
       



    },
    // password visibilty
    eye: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        borderColor: apptheme.teal
    },
    inputpass: {
        height: 50,
        flex: 1,
        paddingVertical: 3
    },
    // border around the text input field
    inputText: {
        height: 50,
        width: "100%",
        borderWidth: 1,
        borderColor: apptheme.teal,
        borderRadius: 10,
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 3,
        flex: 1,
        color:"white"

    },
    img2: {
        width: 200,
        height: 200
    },
    bodyText: {
        textAlign: "center"
    },
    logoView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",

    },
    loginBtn: {
        height: 45,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: apptheme.pink

    },
    opc: {
        paddingHorizontal: 20,
        // paddingVertical:20

    },
    loginText: {
        fontSize: 19,
        fontWeight: "700",
        fontFamily: "MoistlyVengionsDemo-Regular",
        color: "white"
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
    googleSEC: {
        paddingHorizontal: 20
    },
    ScrollViewContainer: {
        // flexGrow: 1,
        justifyContent: "space-between",
        backgroundColor: "white",
        
        
    },
    newHere: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap:10,
       
       

    },
    newHereText: {
        fontSize: 22,
        fontFamily: "Lemoncake Homemade",
        color: apptheme.teal,
    }
})


