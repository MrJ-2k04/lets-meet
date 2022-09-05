import { createContext, useEffect, useReducer } from "react";
import { auth } from "../firebase/config";

export const AuthContext = createContext()

const AuthReducer = (state, action)=>{
    switch (action.type) {
        case "LOGIN":
            return {...state, user: action.payload}

        case "LOGOUT":
            return {...state, user: null}

        case "AUTH_IS_READY":
            return {...state, user: action.payload, authIsReady: true}
        
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children })=>{
    
    const [state, dispatch] = useReducer(AuthReducer,{
        user:null,
        authIsReady: false
    })

    useEffect(()=>{
        const unsub = auth.onAuthStateChanged((user)=>{
            // if (user!==null) {
            //     if (user.providerId!=="firebase") {
            //         user.displayName = user.name;
            //         console.log("one tap user");
            //     }
            // }
            dispatch({ type:"AUTH_IS_READY", payload:user })
            unsub()
        })
    },[])

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    )
}