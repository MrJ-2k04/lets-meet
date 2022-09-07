import { useEffect, useState } from "react"
import { auth } from "../firebase/config"
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth"

export const useGoogleSignin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(true)

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

    return { signInWithGoogle, error, isLoading }
}