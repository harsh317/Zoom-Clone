const express = require('express');
const app = express();
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid')
const io = require('socket.io')(server)
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set("view engine", "ejs")
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get("/:rooms", (req, res) => {
    res.render('room', { roomid: req.params.rooms })
})

io.on("connection", (socket) => {
    socket.on('join-room', (roomId, id) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", id);

        socket.on('messagesend', (message) => {
            console.log(message);
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit("user-disconnected", id);

        })
    })
})

server.listen(process.env.PORT || 3000)