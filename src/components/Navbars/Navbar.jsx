import { Link } from "react-router-dom";
import styles from "assets/css/Navbar.module.css"
import { useAuth } from "services/hooks/useAuth"
import { useSignout } from "services/hooks/useSignout"

function Navbar() {
    const { user } = useAuth();
    const { signUserOut, isLoading, error } = useSignout()

    return (
        <nav className={styles.navbar}>
            <ul>
                <li className={styles.title}>
                    <Link to="/">Logo</Link>
                    <Link to="/">Home</Link>
                </li>

                {isLoading &&
                    <>
                        <li>Loading...</li>
                    </>
                }
                {error &&
                    <>
                        <li>{error}</li>
                    </>
                }
                {!isLoading && !error &&
                    <>
                        {!user &&
                            <>
                                <li>
                                    <Link to="/login">Login</Link>
                                </li>
                                <li>
                                    <Link to="/signup">Signup</Link>
                                </li>
                            </>
                        }
                        {user &&
                            <>
                                <li>
                                    {user.displayName}
                                </li>
                                <li>
                                    <button onClick={()=>signUserOut()} className="btn">Logout</button>
                                </li>
                            </>
                        }
                    </>
                }

            </ul>
        </nav>
    );
}

export default Navbar;