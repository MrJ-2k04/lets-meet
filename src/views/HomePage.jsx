
// Hooks
import { useEffect } from "react";

// Components
import DarkFooter from "components/Footers/DarkFooter";
import IndexHeader from "components/Headers/IndexHeader";
import FinalNavbar from "components/Navbars/FinalNavbar";

// Stylish Stuff
import {motion} from "framer-motion"

function HomePage() {

    useEffect(() => {
        document.body.classList.add("index-page");
        document.body.classList.add("sidebar-collapse");
        setTimeout(() => {
            document.documentElement.classList.remove("nav-open");
        }, 0);
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("index-page");
            document.body.classList.remove("sidebar-collapse");
        };
    });

    const componentVariants = {
        hidden:{
            opacity:0
        },
        visible:{
            opacity:1,
            transition:{ delay:0.2, duration: 1.2 }
        },
        exit:{
            x:"-150vw",
            transition:{ease:"easeInOut"}
        }
    }

    return (
        <>
            <FinalNavbar />
            <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="exit" >
                <div className="wrapper">
                    <IndexHeader />
                    <div className="main">

                    </div>
                    <DarkFooter />
                </div>
            </motion.div>
        </>
    );
}

export default HomePage;