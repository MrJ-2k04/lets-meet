
import { useEffect, useState } from "react";

// Components
import FinalNavbar from "components/Navbars/FinalNavbar";
import DarkFooter from "components/Footers/DarkFooter";

// Stylish Stuff
import { Button, Col, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";
import { motion } from "framer-motion";

const title = "Premium Quality Realtime Meetings, now available for free.";
const para = "Letsmeet is developed using highly Secured Realtime Communication Service. No unauthorized person can access your personal meeting."

function Meeting() {

    const [firstFocus, setFirstFocus] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {
        document.body.classList.add("meeting-page");
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
    }, []);



    const getValidRoomCode = (oriUrl) => {

        const getDashes = (roomCode) => {
            // Checks if code separator - (dashes) are present
            if (roomCode.includes("-")) {
                let iterator = roomCode.matchAll("-");

                // Checking dash locations
                let dashCheck = (iterator.next().value.index === 3 && iterator.next().value.index === 8 && iterator.next().done)
                if (dashCheck) {
                    // Check for Length "abc-defg-hij" = 13
                    if (roomCode.length === 12) {
                        return roomCode;
                    }
                }
            }
            // If code separator - (dashes) not present, add it
            else {
                // If code length is valid without dashes
                if (roomCode.length === 10) {
                    // Add dashes and return
                    roomCode = roomCode.slice(0, 3) + "-" + roomCode.slice(3, 7) + "-" + roomCode.slice(7);
                    return roomCode;
                }
            }
            return "/";
        }

        // Removes Starting "/" if any
        if (oriUrl.startsWith("/")) {
            oriUrl = oriUrl.slice(1);
        }

        // Removes Trailing "/" if any
        if (oriUrl.endsWith("/")) {
            oriUrl = oriUrl.slice(0, oriUrl.length - 1)
        }


        // When full Http formatted url is provided
        try {
            let subUrl = new URL(oriUrl).pathname;

            // Checks if / is occured exactly twice "/meeting/abc-defg-hij"
            let slashCheck = subUrl.match(new RegExp("/", "g")).length === 2;

            if (slashCheck) {
                let roomCode = subUrl.slice(subUrl.indexOf("/", 1) + 1);
                return getDashes(roomCode);
            }
        }
        // When only meeting code is provided
        catch (error) {
            // Must not contain any slashes "/"
            if (!oriUrl.includes("/")) {
                return getDashes(oriUrl);
            }
        }
        console.log("finally part of getRoomCode");
        return "/";
    }


    const handleMeetingRequest = () => {
        if (url !== "") {
            const roomCode = getValidRoomCode(url)
            if (roomCode !== "/") {
                console.log(roomCode);
            } else {
                console.log("Invalid Code");
            }
        } else {
            let randomString = Math.random().toString(36).substring(2, 12);
            // Adding - at 4th and 8th position "aaa-aaaa-aaa"
            let newRoomId = randomString.slice(0, 3) + "-" + randomString.slice(3, 7) + "-" + randomString.slice(7);

            console.log(newRoomId);
        }
    }

    // Stylish Transition Variants
    const componentVariants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.2,
                duration: 0.6,
                when: "beforeChildren",
            }
        },
        exit: {
            opacity: 0,
            transition: { ease: "easeInOut" }
        }
    }
    const childVariant = {
        hidden: {
            y: 50, opacity: 0
        },
        visible: {
            y: 0, opacity: 1,
            transition: { duration: 1.1 }
        },
        imageHidden: {
            x: "-100vw"
        },
        imageVisible: {
            x: 0,
            transition: { delay: 1, type: "spring", stiffness: 50, }
        }
    }

    return (
        <>
            <FinalNavbar />
            <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="wrapper">
                    <div className="page-header">

                        <div className="page-header-image" style={{
                            backgroundImage: "url(" + require("assets/img/pink_bg.jpg") + ")"
                        }} />
                        <div className="outer-container">
                            <Row className="inner-container">

                                {/* Text Section */}
                                <Col md={{ size: 5, order: 2 }} className="url-container">
                                    <motion.div variants={childVariant}>
                                        <h3>
                                            {title}
                                        </h3>
                                        <p>{para}</p>
                                        {/* Input Controls */}
                                        <Row>

                                            {/* Host/Join Button */}
                                            <Col xs="4">
                                                <motion.div
                                                    whileHover={{ rotate: -5, scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 700 }}
                                                >
                                                    <Button
                                                        id="google-login"
                                                        block
                                                        className="btn-round d-flex justify-content-center"
                                                        color="primary"
                                                        size="lg"
                                                        onClick={handleMeetingRequest}
                                                    >
                                                        {url.length > 0 ? "Join" : "Host"}
                                                    </Button>
                                                </motion.div>
                                            </Col>

                                            {/* Url Input */}
                                            <Col>
                                                <InputGroup
                                                    className={
                                                        "no-border input-lg mt-2" +
                                                        (firstFocus ? " input-group-focus" : "")
                                                    }
                                                >
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText>
                                                            <span className="material-icons">
                                                                insert_link
                                                            </span>
                                                        </InputGroupText>
                                                    </InputGroupAddon>

                                                    <Input
                                                        placeholder="Meeting Code or URL"
                                                        type="text"
                                                        onFocus={() => setFirstFocus(true)}
                                                        onBlur={() => setFirstFocus(false)}
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        onKeyUp={(e) => e.key === "Enter" ? handleMeetingRequest() : ""}
                                                        required
                                                    ></Input>
                                                </InputGroup>
                                            </Col>

                                        </Row>
                                    </motion.div>
                                </Col>

                                {/* Image Section */}
                                <Col md={{ size: 7, order: 1 }}>
                                    <motion.div className="meeting-image-container"
                                        variants={childVariant}
                                        initial="imageHidden"
                                        animate="imageVisible"
                                    >
                                        <img
                                            className="meeting-image"
                                            alt="..."
                                            src={require("assets/img/meeting4.png")}
                                        ></img>
                                    </motion.div>
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

export default Meeting;