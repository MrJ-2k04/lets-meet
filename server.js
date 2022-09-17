

// Setup
const app = require("express")()
const server = require("http").createServer(app)
app.set("port", 3030)

var connections = {}
var hosts = {}

// Allows Cross Origin
const corsOptions = {
    origin: "*"
    // origin: ["http://localhost:3000","https://localhost:3000"]
}
// Creating IO using Custom CORS Policy
const io = require("socket.io")(server, { cors: corsOptions })

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

app.get("/status",(req,res)=>{
    console.log(req.url);
    res.json({name:"MrJ"})
})

io.on("connection", (socket) => {

    // Signaling Service on Server side to Power WebRTC
    socket.on("signal",(toUser,msg)=>{
        io.to(toUser).emit("signal",socket.id,msg);
    })

    socket.on("user-joined", (path,uid) => {
        // Add New Room to Server Connections List
        if (connections[path] === undefined) {
            connections[path] = [];
            hosts[path]=uid;
        }
        console.log(hosts);
        connections[path].push(socket.id);

        // Inform all other users in Room about New Member
        connections[path].forEach(user=>{
            io.to(user).emit("user-joined",socket.id,connections[path]);
        })

        // Log
        console.log(path, "  user:", socket.id, connections[path]);
    })

    socket.on("disconnect", () => {
        // Loop Through all Rooms
        for (let [path, room] of Object.entries(connections)) {
            // Loop through all Users in Each Room
            room.forEach((userSocket,idx) => {
                if(userSocket === socket.id){

                    // Removing Socket id from list
                    room.splice(idx,1);
                    console.log(path, " dc_user:", socket.id, connections[path]);

                    // Inform Other Users in Room about Left User
                    room.forEach(user=>{
                        io.to(user).emit("user-left",socket.id);
                    })

                    // Delete Room if no more users are there
                    if (!connections[path].length) {
                        delete connections[path];
                    }
                }
            })
        }
    })

    // To be Continued
    socket.on("end-for-all",(path)=>{
        connections[path].forEach(user=>{
            io.to(user).emit("end-for-all")
        })
        delete connections[path];
        console.log(connections);
    })

}) // end io connect



// Starting the Server
server.listen(app.get("port"), () => {
    console.log("Server started on port", app.get("port"), "...");
})
