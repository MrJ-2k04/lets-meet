import { useState } from "react";
import styles from "./Login.module.css"
import {useSignin} from "services/hooks/useSignin"

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const {signIn, isLoading, error} = useSignin()

    const handleLogin = (e)=>{
        e.preventDefault()
        signIn(email, password);
    }

    return ( 
        <div>
            <form onSubmit={handleLogin} className={styles["login-form"]} action="">
                <h2>Login</h2>
                <label>
                    <span>Email</span>
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
                </label>
                <label>
                    <span>Password</span>
                    <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
                </label>
                {!isLoading && <button className="btn">Login</button>}
                {isLoading && <button className="btn" disabled>Logging in...</button>}
                <br />
                {error &&<p>{error}</p>}
            </form>
        </div>
     );
}

export default Login;