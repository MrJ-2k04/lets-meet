import { useEffect, useState } from "react"
import { auth } from "../firebase/config"
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth"
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

    const signInWithGoogle = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider()
            await signInWithRedirect(auth, provider).then(res => {
                setError(null);
                setIsLoading(false)
            }, err => {
                if (isMounted) {
                    console.log(err);
                    setError(err.message);
                    setIsLoading(false);
                }
            });
            // await getRedirectResult(auth).then(userCred=>{
            //     console.log(userCred);
            // }).catch(err=>{
            //     if (isMounted) {
            //         console.log(err);
            //         setError(err.message);
            //         setIsLoading(false);
            //     }
            // })
        } catch (error) {
            if (isMounted) {
                console.log(error);
                setError(error.message);
                setIsLoading(false);
            }
        }

    }

    useEffect(() => {
        setIsMounted(true)
        return () => {
            setIsMounted(false)
        }
    },[])

    return { signIn, signInWithGoogle, error, isLoading }
}