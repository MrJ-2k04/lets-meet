import { signOut } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase/config";
import { useAuth } from "./useAuth";

export const useSignout = ()=>{

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const {dispatch}=useAuth()

    const signUserOut = ()=>{
        setIsLoading(true)

        signOut(auth)
        .then(res=>{

            // Update Global User State
            dispatch({type: "LOGOUT"})

            setIsLoading(false)
            setError(null)
        })
        .catch(err=>{
            setError(err)
            setIsLoading(false)
        })
    }
    return {signUserOut, isLoading, error}
}