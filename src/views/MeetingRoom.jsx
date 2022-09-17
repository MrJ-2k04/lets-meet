
import { useEffect, useRef, useState } from 'react';


// Components
import FinalNavbar from 'components/Navbars/FinalNavbar';
import DarkFooter from 'components/Footers/DarkFooter';
import FourDotLoader from 'components/Extras/FourDotLoader';

// Stylish stuff
import { motion } from "framer-motion"
import { Button, Col, Input, Row } from 'reactstrap';

// Socket
import { io } from "socket.io-client"
import { useAuth } from 'services/hooks/useAuth';

const peerConnectionConfig = {
    'iceServers': [
        // { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' },
    ]
}
// const server_url = "http://localhost:3030";
const server_url = "https://api.1tapboosting.in";
var connections = {};
// var socket = null;
// var socketId = null;
var elms = 0;


// Animation Variants
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
    const [isChecking, setIsChecking] = useState(false);

    // Multimedia Stuff
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [messages, setMessages] = useState([]);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [gettingPermission, setGettingPermission] = useState(false);
    const { user } = useAuth()
    // Refs (stateless)
    let videoAvailable = useRef(false);
    let audioAvailable = useRef(false);
    let myVidRef = useRef();
    let socket = useRef(null);
    let socketId = useRef();

    const init = () => {
        document.body.classList.add("meeting-room-page");
        document.body.classList.add("sidebar-collapse");
        setTimeout(() => {
            document.documentElement.classList.remove("nav-open");
        }, 0);
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    }

    // Initialiser - Constructor
    useEffect(() => {
        init()
        // Initialise Media to whatever values are given
        setGettingPermission(true,
            getPermissions().then(
                () => {
                    setGettingPermission(false)
                    setVideo(videoAvailable);
                    setAudio(audioAvailable);
                }
            )
        )
        return function cleanup() {
            if (socket !== null && socket.current !== undefined && socket.current !== null) {
                socket.current.disconnect();
                socket = null;
            }
            document.body.classList.remove("meeting-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }, [])



    const getPermissions = async () => {
        try {

            await navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => videoAvailable = true)
                .catch(() => videoAvailable = false)

            await navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => audioAvailable = true)
                .catch(() => audioAvailable = false)

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true)
            } else {
                setScreenAvailable(false)
            }

            if (videoAvailable || audioAvailable) {
                navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
                    .then((stream) => {
                        window.localStream = stream
                        myVidRef.current.srcObject = stream
                    })
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
            return;
        } catch (e) { console.log(e); return; }
    }

    const updateUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(updateUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = myVidRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    const updateUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        myVidRef.current.srcObject = stream


        updateSocketMediastream(window.localStream);

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false, setAudio(false, () => {
                try {
                    let tracks = myVidRef.current.srcObject.getTracks()
                    tracks.forEach(track => track.stop())
                } catch (e) { console.log(e) }

                let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                window.localStream = blackSilence()
                myVidRef.current.srcObject = window.localStream

                for (let id in connections) {
                    connections[id].addStream(window.localStream)

                    connections[id].createOffer().then((description) => {
                        connections[id].setLocalDescription(description)
                            .then(() => {
                                socket.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }))

        })
    }

    const silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    const black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }


    // Signaling Service to Power WebRTC
    const gotSignal = (from, msg) => {
        let signal = JSON.parse(msg);
        if (from !== socketId.current) {
            if (signal.sdp) {
                connections[from].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[from].createAnswer()
                                .then(description => connections[from].setLocalDescription(description)
                                    .then(() => socket.current.emit("signal", from, JSON.stringify({ "sdp": description })))
                                    .catch(er => console.log(er)))
                                .catch(er => console.log(er))
                        }
                    })
                    .catch(er => console.log(er))
            }
            if (signal.ice) {
                connections[from].addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(err => console.log(err))
            }
        }
    }


    const connectToSocketServer = () => {

        socket.current = io.connect(server_url, { secure: true, reconnection: false })

        socket.current.on('signal', gotSignal)

        socket.current.on('connect', () => {
            // Stops Loading Screen and Starts Meeting
            setInMeeting(true);
            setIsChecking(false);

            socket.current.emit('user-joined', window.location.href, user.uid);
            socketId.current = socket.current.id

            // socket.on('chat-message', addMessage)

            socket.current.on('user-left', (id) => {
                let video = document.querySelector(`[data-socket="${id}"]`)
                if (video !== null) {
                    elms--
                    video.parentNode.removeChild(video)

                    let main = document.getElementById('main')
                    changeCssVideos(main)
                }
            })

            // Very very imp to understand b4 going any further!!
            socket.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConnectionConfig)
                    // Wait for their ice candidate
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socket.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        // TODO mute button, full screen button
                        var searchVidep = document.querySelector(`[data-socket="${socketListId}"]`)
                        if (searchVidep !== null) { // if i don't do this check it make an empyt square
                            searchVidep.srcObject = event.stream
                        } else {
                            elms = clients.length
                            let main = document.getElementById('main')
                            let cssMesure = changeCssVideos(main)

                            let video = document.createElement('video')

                            let css = {
                                minWidth: cssMesure.minWidth, minHeight: cssMesure.minHeight, maxHeight: "100%", margin: "10px",
                                borderStyle: "solid", borderColor: "#bdbdbd", objectFit: "fill"
                            }
                            for (let i in css) video.style[i] = css[i]

                            video.style.setProperty("width", cssMesure.width)
                            video.style.setProperty("height", cssMesure.height)
                            video.setAttribute('data-socket', socketListId)
                            video.srcObject = event.stream
                            video.autoplay = true
                            video.playsinline = true

                            main.appendChild(video)
                        }
                    }

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketId.current) {
                    updateSocketMediastream(window.localStream);
                }
            })
        })

        socket.current.on("error", () => {
            setIsChecking(false);
        })
    }

    const updateSocketMediastream = (stream) => {
        if (socket !== null && socket.current !== null) {
            for (let other in connections) {
                // Ignore own id
                if (other === socket.current.id) continue;

                // Add our stream to their feed
                try {
                    connections[other].addStream(stream)
                } catch (error) { }

                // Send the added stream via signaling
                connections[other].createOffer()
                    .then(description => connections[other].setLocalDescription(description)
                        .then(() => socket.current.emit("signal", other, JSON.stringify({ "sdp": description }))
                        ))
            }
        }
    }

    const changeCssVideos = (main) => {
        let widthMain = main.offsetWidth
        let minWidth = "30%"
        if ((widthMain * 30 / 100) < 300) {
            minWidth = "300px"
        }
        let minHeight = "40%"

        let height = String(100 / elms) + "%"
        let width = ""
        if (elms === 0 || elms === 1) {
            width = "100%"
            height = "100%"
        } else if (elms === 2) {
            width = "45%"
            height = "100%"
        } else if (elms === 3 || elms === 4) {
            width = "35%"
            height = "50%"
        } else {
            width = String(100 / elms) + "%"
        }

        let videos = main.querySelectorAll("video")
        for (let a = 0; a < videos.length; ++a) {
            videos[a].style.minWidth = minWidth
            videos[a].style.minHeight = minHeight
            videos[a].style.setProperty("width", width)
            videos[a].style.setProperty("height", height)
        }

        return { minWidth, minHeight, width, height }
    }

    const copyUrl = () => {
        let text = window.location.href
        if (!navigator.clipboard) {
            let textArea = document.createElement("textarea")
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            try {
                document.execCommand('copy')
                alert("Link copied to Clipboard!");
                // message.success("Link copied to clipboard!")
            } catch (err) {
                alert("Failed to copy");
                // message.error("Failed to copy")
            }
            document.body.removeChild(textArea)
            return
        }
        navigator.clipboard.writeText(text).then(function () {
            alert("Link copied to Clipboard!");
            // message.success("Link copied to clipboard!")
        }, () => {
            alert("Failed to copy");
            // message.error("Failed to copy")
        })
    }

    // Checks server status, thereafter makes callback
    const checkServerStatus = () => {
        return new Promise(resolve => {
            setIsChecking(true);
            fetch(server_url + "/status").then(res => {
                if (res.status === 200) {
                    // Resolves promise to continue with .then stuff in caller
                    resolve();
                }
            }).catch(err => {
                setIsChecking(false);
                // Alerts user that the backend server is unavailable
                alert("Cannot connect to server due to network issue!");
            })
        })
    }

    const toggleVideo = () => setVideo(!video);
    const toggleAudio = () => setAudio(!audio);
    // Main Starting Point for Connection
    const connect = () => {
        checkServerStatus().then(() => {
            connectToSocketServer()
            // setVideo(videoAvailable,
            //     setAudio(audioAvailable, connectToSocketServer())
            // )
        })
    }

    useEffect(updateUserMedia, [video, audio]);
    useEffect(!isChecking ? updateUserMedia : () => { }, [isChecking]);

    return (<>
        {!isChecking && <div className='img-bg'
        // style={{ backgroundImage: "url(" + require("assets/img/meetingroom_bg.jpg") + ")" }}
        >
            {!inMeeting &&
                <motion.div
                    variants={componentVariants} initial="hidden"
                    animate="visible"
                >
                    <FinalNavbar />
                    <div className="wrapper">
                        <div className="page-header">
                            <div className="outer-container mt-0">
                                <Row className='inner-container'>
                                    <Col xs={{ size: 12, order: 2 }} lg={{ size: 7, order: 1 }}>
                                        <video autoPlay muted className='video-preview' ref={myVidRef}></video>
                                        <div className="over-video">
                                            <Button onClick={toggleAudio} className='icon-btn mr-4' color='primary'>
                                                <span className="material-icons">{audio ? "mic" : "mic_off"}</span>
                                            </Button>
                                            <Button onClick={toggleVideo} className='icon-btn ml-4' color='primary'>
                                                <span className="material-icons">{video ? "videocam" : "videocam_off"}</span>
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col lg={{ size: 5, order: 2 }}>
                                        <Row>
                                            <Col xs="12">
                                                <h2>Ready to join?</h2>
                                            </Col>
                                            <Col>
                                                <Button
                                                    block
                                                    className='btn-round'
                                                    color='primary'
                                                    size='lg'
                                                    style={{ maxWidth: "50%", margin: "0 auto" }}
                                                    onClick={connect}
                                                >Join</Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                            </div>
                        </div>
                        <DarkFooter />
                    </div>
                </motion.div>}
            {inMeeting &&
                <motion.div
                    variants={componentVariants} initial="hidden"
                    animate="visible"
                >
                    <div className="float-bottom" style={{ backgroundColor: "rgb(0 0 0 / 16%)" }}>
                        <div className="left-container">
                            <h5>{new Date().getHours() + ":" + new Date().getMinutes()}
                                &nbsp; | {window.location.href.toString().slice(-12)}
                                &nbsp;
                                <span className="copy-btn icon material-icons">content_copy</span>
                            </h5>
                        </div>
                        <div className="btn-container">
                            <Button className='icon-btn mr-2' onClick={toggleVideo} color="primary">
                                <span className="material-icons">{video ? "videocam" : "videocam_off"}</span>
                            </Button>

                            <Button className='icon-btn mr-2 ml-2' onClick={toggleAudio} color="primary">
                                <span className="material-icons">{audio ? "mic" : "mic_off"}</span>
                            </Button>

                            {screenAvailable === true ?
                                <Button className='icon-btn ml-2' color="primary" onClick={() => { }}>
                                    <span className="material-icons">screen_share</span>
                                    {/* {this.state.screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />} */}
                                </Button>
                                : null}

                            <Button className='end-call-btn icon-btn mr-2 ml-2' onClick={() => { }}>
                                <span className="material-icons">call_end</span>
                            </Button>

                            {/* <Badge badgeContent={this.state.newmessages} max={999} color="secondary" onClick={this.openChat}>
                                <IconButton style={{ color: "#424242" }} onClick={this.openChat}>
                                    <ChatIcon />
                                </IconButton>
                            </Badge> */}
                        </div>
                        <div className="right-container">
                            <h4></h4>
                        </div>
                    </div>
                    <div className="my-container">
                        <div style={{ paddingTop: "20px" }}>
                            <Input value={window.location.href} onChange={() => { }} disable="true" hidden></Input>
                            <Button style={{
                                backgroundColor: "#3f51b5", color: "whitesmoke", marginLeft: "20px",
                                marginTop: "10px", width: "120px", fontSize: "10px"
                            }} onClick={copyUrl}>Copy invite link</Button>
                        </div>
                        <Row id="main" className="flex-container" style={{ margin: 0, padding: 0 }}>
                            <video id="my-video" ref={myVidRef} autoPlay muted style={{
                                borderStyle: "solid", borderColor: "#bdbdbd", margin: "10px", objectFit: "fill",
                                width: "100%", height: "100%"
                            }}></video>
                        </Row>
                    </div>

                </motion.div>
            }
        </div>}
        {isChecking && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FourDotLoader />
        </motion.div>}
    </>
    );
}

export default MeetingRoom;