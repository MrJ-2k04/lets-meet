
// Router
import { Route, Routes, Navigate, Link, useLocation, useNavigate } from "react-router-dom";

// Hooks
import { useAuth } from "services/hooks/useAuth";

// Css & Styles
import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";
import "assets/demo/demo.css?v=1.5.0";
import "assets/demo/nucleo-icons-page-styles.css?v=1.5.0";
import "assets/css/app.css"

// Pages
import Index from "views/examples/Index";
import NucleoIcons from "views/examples/NucleoIcons";
import SignUp from "views/index-sections/SignUp";
import ProfilePage from "views/examples/ProfilePage.js";
// Self Made Pages
import HomePage from "views/HomePage";
import Meeting from "views/Meeting";
import MeetingRoom from "views/MeetingRoom";
// import FourDotLoader from "components/Loaders/FourDotLoader";
import Login from "views/Login";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
// import OneTapLogin from "services/hooks/OneTapLogin";

function App() {

    const location = useLocation();
    const { user } = useAuth()
    const nav = useNavigate();

    useEffect(()=>{
        if (user&&(location.pathname==="/login"||location.pathname==="/signup")) {
            nav("/");
        }
    },[user,location,nav])

    return (
        <AnimatePresence mode="wait" presenceAffectsLayout="false">
            <Routes location={location} key={location.key}>
                <Route path="/" element={<HomePage test={location.key} />} />

                <Route path="/index" element={<Index />} />
                <Route
                    path="/nucleo-icons"
                    element={<NucleoIcons />}
                />

                <Route path='/login' element={!user && <Login />} />
                <Route path='/signup' element={!user && <SignUp />} />

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
        </AnimatePresence>
    );
}

export default App;