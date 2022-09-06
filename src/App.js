
// Router
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

// Hooks
import { useAuth } from "services/hooks/useAuth";

// Css & Styles
import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";
import "assets/demo/demo.css?v=1.5.0";
import "assets/demo/nucleo-icons-page-styles.css?v=1.5.0";
import "assets/css/app.css"

// Pages
import Index from "views/Index.js";
import NucleoIcons from "views/NucleoIcons.js";
import SignUp from "views/index-sections/SignUp";
import ProfilePage from "views/examples/ProfilePage.js";
// Self Made Pages
import HomePage from "views/HomePage";
import Meeting from "views/Meeting";
import MeetingRoom from "views/MeetingRoom";
import FourDotLoader from "components/Loaders/FourDotLoader";
import Login from "views/Login";
// import OneTapLogin from "services/hooks/OneTapLogin";

function App() {

    const { authIsReady, user } = useAuth()

    return (
        <div className="App">
            {/* <OneTapLogin /> */}
            {authIsReady &&
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />

                        <Route path="/index" element={<Index />} />
                        <Route
                            path="/nucleo-icons"
                            element={<NucleoIcons />}
                        />

                        <Route path='/login' element={
                            <>
                                {!user && <Login />}
                                {user && <Navigate replace to="/" />}
                            </>
                        } />
                        <Route path='/signup' element={
                            <>
                                {!user && <SignUp />}
                                {user && <Navigate replace to="/" />}
                            </>
                        } />

                        <Route path='/profile' element={
                            <>
                                {user && <ProfilePage />}
                                {!user && <Navigate replace to="/login" />}
                            </>
                        } />
                        <Route path='/meeting' element={
                            <>
                                {user && <Meeting />}
                                {!user && <Navigate replace to="/login" />}
                            </>
                        } />
                        <Route path='/meeting/:roomid' element={<>
                            {user && <MeetingRoom />}
                            {!user && <Navigate replace to="/login" />}
                        </>} />

                        <Route path="*" element={<>404 Not Found <Link to="/">Home</Link></>} />

                    </Routes>

                </BrowserRouter>
            }
            {!authIsReady && <FourDotLoader />}
        </div>
    );
}

export default App;