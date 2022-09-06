

import DarkFooter from "components/Footers/DarkFooter";
import IndexHeader from "components/Headers/IndexHeader";
import FinalNavbar from "components/Navbars/FinalNavbar";
// import IndexNavbar from "components/Navbars/IndexNavbar";
import Navbar from "components/Navbars/Navbar";

import { useEffect } from "react";


function HomePage() {
    useEffect(() => {
        document.body.classList.add("index-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("index-page");
            document.body.classList.remove("sidebar-collapse");
        };
    });
    return (
        <>
            <FinalNavbar />
            <div className="wrapper">
                <IndexHeader />
                <Navbar />
                <div className="main">

                </div>
                <DarkFooter />
            </div>
        </>
    );
}

export default HomePage;