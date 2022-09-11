
import { useEffect, useRef, useState } from 'react';

// Components
import FinalNavbar from 'components/Navbars/FinalNavbar';
import DarkFooter from 'components/Footers/DarkFooter';

// Stylish stuff
import { motion } from "framer-motion"
import { Button, Col, Row } from 'reactstrap';

const componentVariants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1
    }
}

function MeetingRoom() {

    const [inMeeting, setInMeeting] = useState(false);
    const myVidRef = useRef();

    
    useEffect(()=>{
        document.body.classList.add("meeting-room-page");
        document.body.classList.add("sidebar-collapse");
        setTimeout(() => {
            document.documentElement.classList.remove("nav-open");
        }, 0);
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;

        return function cleanup() {
            document.body.classList.remove("meeting-page");
            document.body.classList.remove("sidebar-collapse");
        };
    },[])


    return (
        <>
            {inMeeting && <FinalNavbar />}
            <motion.div
                variants={componentVariants} initial="hidden"
                animate="visible"
            >
                <div className="wrapper">
                    <div className="page-header">
                        <div className="outer-container">
                            <Row className='inner-container'>
                                <Col sm="12" md="7">
                                    <video className='video-preview' ref={myVidRef}></video>
                                </Col>
                                <Col>
                                    <Button onClick={() => setInMeeting(!inMeeting)}>Toggle Navbar</Button>
                                </Col>
                            </Row>
                            
                        </div>
                    </div>
                    <DarkFooter />
                </div>
            </motion.div>
        </>
    );
}

export default MeetingRoom;