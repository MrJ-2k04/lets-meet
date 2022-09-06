
import { useEffect, useState } from "react";

// Components
import FinalNavbar from "components/Navbars/FinalNavbar";
import DarkFooter from "components/Footers/DarkFooter";

// Stylish Stuff
import { Button, Col, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";

const title = "Premium Quality Realtime Meetings, now available for free.";
const para = "Letsmeet is developed using highly Secured Realtime Communication Service. No unauthorized person can access your personal meeting."

function Meeting() {

    const [firstFocus, setFirstFocus] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {
        document.body.classList.add("meeting-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;

        return function cleanup() {
            document.body.classList.remove("meeting-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }, []);

    const filterUrl = (oriUrl) => {

        // Removes Starting "/" if any
        if (oriUrl.startsWith("/")) {
            oriUrl = oriUrl.slice(1);
        }
        // Removes Trailing "/" if any
        if (oriUrl.endsWith("/")) {
            oriUrl = oriUrl.slice(0, oriUrl.length - 1)
        }

        if (oriUrl.includes("/")) {
            try {
                // When full Http formatted url is provided
                let subUrl = new URL(oriUrl).pathname;

                // Checks whether / is repeated more than twice
                let iterator = subUrl.matchAll("/")
                iterator.next();
                iterator.next();
                const beforeSlashValid = iterator.next().done;

                if (beforeSlashValid) {
                    let filteredUrl = subUrl.slice(subUrl.indexOf("/", 1));
                    // Removes Final - (dashes)
                    if (filteredUrl.includes("-")) {
                        filteredUrl = filteredUrl.replaceAll("-", "");
                    }
                    // Final Check of Length
                    if (filteredUrl.length === 11) {
                        // Success
                        return filteredUrl;
                    }
                    return "/"
                } else {
                    return "/";
                }
            } catch (error) {
                console.log("some error occured while parsing url", error);
                return "/"
            }
        } else {

            // Removes Final - (dashes)
            if (oriUrl.includes("-")) {
                oriUrl = oriUrl.replaceAll("-", "");
            }

            // Final Check of Length
            if (oriUrl.length === 10) {
                // Success
                return "/" + oriUrl;
            }
            return "/";
        }
    }

    const handleMeetingRequest = () => {
        if (url !== "") {
            console.log(url, "\nurl:", filterUrl(url));
        } else {
            let randomString = Math.random().toString(36).substring(2, 12);
            // Adding - at 5th position
            let newRoomId = randomString.slice(0, 3) + "-" + randomString.slice(3, 7) + "-" + randomString.slice(7);

            console.log(newRoomId);
        }
    }

    return (
        <>
            <FinalNavbar />
            <div className="wrapper">
                <div className="page-header">

                    <div className="page-header-image" style={{
                        backgroundImage: "url('https://wallpaperaccess.com/full/6663895.jpg')"
                    }} />
                    <div className="outer-container">
                        <Row className="inner-container">

                            {/* Text Section */}
                            <Col md={{ size: 5, order: 2 }} className="url-container">
                                <h3>{title}</h3>
                                <p>{para}</p>
                                {/* Input Controls */}
                                <Row>

                                    {/* Host/Join Button */}
                                    <Col xs="4">
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
                                                required
                                            ></Input>
                                        </InputGroup>
                                    </Col>

                                </Row>
                            </Col>

                            {/* Image Section */}
                            <Col md={{ size: 7, order: 1 }}>
                                <div className="meeting-image-container">
                                    <img
                                        className="meeting-image"
                                        alt="..."
                                        src={require("assets/img/meeting4.png")}
                                    ></img>
                                </div>
                            </Col>

                        </Row>
                    </div>

                </div>
                <DarkFooter />
            </div>

        </>
    );
}

export default Meeting;