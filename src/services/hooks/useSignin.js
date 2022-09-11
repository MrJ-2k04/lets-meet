import { useEffect, useState } from "react"
import { auth } from "../firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuth } from "./useAuth"
// import Axios from "axios"

export const useSignin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(true)
    const { dispatch } = useAuth()


    const signIn = async (email, password) => {
        setError(null)
        setIsLoading(true)

        try {
            const res = await signInWithEmailAndPassword(auth, email, password)

            if (!res) {
                throw new Error("Cannot sign in to the account!")
            }

            // Update Global User State
            dispatch({ type: "LOGIN", payload: res.user })

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


    useEffect(() => {
        setIsMounted(true)
        return () => {
            setIsMounted(false)
        }
    }, [])

    return { signIn, error, isLoading }
}