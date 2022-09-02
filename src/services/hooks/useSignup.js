import { useEffect, useState } from "react"
import { auth } from "../firebase/config"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useAuth } from "./useAuth"

export const useSignup =  ()=>{
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isMounted, setIsMounted]=useState(true)
    const {dispatch} = useAuth()
    
    const signup = async (name, email, password)=>{
        setError(null)
        setIsLoading(true)
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)
            
            if (!res) {
                throw new Error("Cannot create user!")
            }

            await updateProfile(res.user, {displayName : name})

            // Update Global User State
            dispatch({type: "LOGIN", payload: res.user})

            if (isMounted) {
                setIsLoading(false)
                setError(null)
            }

        } catch (error) {
            if (isMounted) {
                setError(error.message)
                setIsLoading(false)
            }
        }
    }

    useEffect(()=>{
        setIsMounted(true)
        return ()=>{
            setIsMounted(false)
        }
    },[])
    
    return {signup, error, isLoading}
}