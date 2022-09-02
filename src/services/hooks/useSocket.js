import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocket = ()=>{
    const socket = useContext(SocketContext)
    if (socket===undefined) {
        throw new Error("Cannot use Socket Context outside SocketContextProvider")
    }
    return socket;
}