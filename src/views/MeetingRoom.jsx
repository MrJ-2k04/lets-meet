
import { useEffect, useRef, useState } from 'react';


// Components
import FinalNavbar from 'components/Navbars/FinalNavbar';
import DarkFooter from 'components/Footers/DarkFooter';

// Stylish stuff
import { motion } from "framer-motion"
import { Button, Col, Row } from 'reactstrap';

// Socket
import { io } from "socket.io-client"
const peerConnectionConfig = {
    'iceServers': [
        // { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' },
    ]
}
const server_url = "http://localhost:3030";
var connections = {};
var socket = null;
var socketId = null;
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

    // Multimedia Stuff
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [gettingPermission, setGettingPermission] = useState(false);
    // Refs (stateless)
    let videoAvailable = useRef(false);
    let audioAvailable = useRef(false);
    let myVidRef = useRef();

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

        // for (let id in connections) {
        // 	if (id === socketId) continue

        // 	connections[id].addStream(window.localStream)

        // 	connections[id].createOffer().then((description) => {
        // 		connections[id].setLocalDescription(description)
        // 			.then(() => {
        // 				socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
        // 			})
        // 			.catch(e => console.log(e))
        // 	})
        // }
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
                                socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
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
        if (from !== socketId) {
            if (signal.sdp) {
                connections[from].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[from].createAnswer()
                                .then(description => connections[from].setLocalDescription(description)
                                    .then(() => socket.emit("signal", from, JSON.stringify({ "sdp": description })))
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

        setInMeeting(true);
        socket = io.connect(server_url, { secure: true })

        socket.on('signal', gotSignal)

        socket.on('connect', () => {
            socket.emit('user-joined', window.location.href)
            socketId = socket.id

            // socket.on('chat-message', this.addMessage)

            socket.on('user-left', (id) => {
                let video = document.querySelector(`[data-socket="${id}"]`)
                if (video !== null) {
                    elms--
                    video.parentNode.removeChild(video)

                    let main = document.getElementById('main')
                    changeCssVideos(main)
                }
            })

            // Very very imp to understand b4 going any further!!
            socket.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConnectionConfig)
                    // Wait for their ice candidate
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
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

                if (id === socketId) {
                    updateSocketMediastream(window.localStream);
                }
            })
        })
    }

    const updateSocketMediastream = (stream) => {
        for (let other in connections) {
            // Ignore own id
            if (other === socket.id) continue;

            // Add our stream to their feed
            try {
                connections[other].addStream(stream)
            } catch (error) { }

            // Send the added stream via signaling
            connections.current[other].createOffer()
                .then(description => connections.current[other].setLocalDescription(description)
                    .then(() => socket.emit("signal", other, JSON.stringify({ "sdp": description }))
                    ))
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

    const toggleVideo = () => setVideo(!video);
    const toggleAudio = () => setAudio(!audio);
    const connect = () => {
        setVideo(videoAvailable,
            setAudio(audioAvailable, connectToSocketServer())
        )
    }

    useEffect(updateUserMedia, [video, audio]);

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
                                <Col xs={{ size: 12, order: 2 }} lg={{ size: 7, order: 1 }}>
                                    <video autoPlay className='video-preview' ref={myVidRef}></video>
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
            </motion.div>
        </>
    );
}

export default MeetingRoom;