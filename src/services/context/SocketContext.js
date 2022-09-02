import { createContext, useCallback, useReducer } from "react";
import { io } from "socket.io-client";



// const setupSocket = useCallback(() => {

//     socket.on("connect", () => {
//         socket.emit("user-joined", window.location.href);

//         socket.on("signal", gotSignal);

//         socket.on("user-left", id => {
//             let vidToDelete = document.querySelector(`[data-id="${id}"]`)
//             if (vidToDelete !== null) {
//                 vidToDelete.parentNode.removeChild(vidToDelete);
//             }
//             delete connections.current[id];
//             console.log("User Left:", id);
//         })

//         socket.on("disconnect", () => {
//             // More to be done
//             connections.current = {}
//         })

//         // Main Logic for Connection
//         socket.on("user-joined", (id, clients) => {
//             let config = JSON.parse(process.env.REACT_APP_PEER_CONFIG)
//             console.log("new client", id, clients, connections);

//             // Set Defaults of Each Connection (inc. this)
//             clients.forEach(user => {
//                 connections.current[user] = new RTCPeerConnection(config)

//                 connections.current[user].onicecandidate = ev => {
//                     if (ev.candidate !== null) {
//                         socket.emit("signal", user, JSON.stringify({ "ice": ev.candidate }))
//                     }
//                 };

//                 // When we get stream feed from remote
//                 connections.current[user].onaddstream = ev => {
//                     let searchVid = document.querySelector(`[data-id="${user}"]`);
//                     if (searchVid !== null) {
//                         searchVid.srcObject = ev.stream;
//                     } else {
//                         let otherVid = document.createElement("video");
//                         otherVid.setAttribute("data-id", user);
//                         otherVid.srcObject = ev.stream;
//                         let box = document.querySelector("#mainStuff");
//                         box.appendChild(otherVid);
//                         box.appendChild(document.createElement("br"));
//                     }
//                 }

//                 // Add localstream to remote
//                 if (localStream !== null) {
//                     connections.current[user].addStream(localStream)
//                 } else {
//                     let blankStream = (...args) => new MediaStream([black(...args), silence()]);
//                     let localStream = blankStream()
//                     connections.current[user].addStream(localStream);
//                 }
//             })

//             // When we join someone else's meeting with existing members
//             if (id === socket.id) {
//                 // Update Streams via Signaling
//                 updateMediaStream(localStream);
//             }

//             // console.log("New User Joined",id);
//         })


//     })

// }, [socket, localStream, gotSignal, updateMediaStream])


// const gotSignal = useCallback((from, msg) => {
//     let signal = JSON.parse(msg);
//     if (from !== socket.id) {
//         if (signal.sdp) {
//             connections.current[from].setRemoteDescription(new RTCSessionDescription(signal.sdp))
//                 .then(() => {
//                     if (signal.sdp.type === "offer") {
//                         connections.current[from].createAnswer()
//                             .then(description => connections.current[from].setLocalDescription(description)
//                                 .then(() => socket.emit("signal", from, JSON.stringify({ "sdp": description })))
//                                 .catch(er => console.log(er)))
//                             .catch(er => console.log(er))
//                     }
//                 })
//                 .catch(er => console.log(er))
//         }
//         if (signal.ice) {
//             connections.current[from].addIceCandidate(new RTCIceCandidate(signal.ice))
//                 .catch(err => console.log(err))
//         }
//     }
// }, [socket])


export const SocketContext = createContext()

const socketReducer = (state, action) => {
    switch (action.type) {
        case "CONNECT":
            let sock = io.connect(process.env.REACT_APP_SERVER_URL)
            // setupSocket(sock);
            return { ...state, socket: sock, isConnected: true }

        case "DISCONNECT":
            console.log("Disconnected!");
            return { ...state, socket: null, isConnected: false }

        default:
            break;
    }
}

// const connect = ()=>{
//     dispatch({type:"CONNECT",payload: io})
// }

export function SocketProvider({ children }) {

    const [state, dispatch] = useReducer(socketReducer, {
        socket: null,
        isConnected: false
    })


    return (
        <SocketContext.Provider value={{ ...state, dispatch }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;





