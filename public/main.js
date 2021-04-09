const socket = io('/')
const main__chat__window = document.getElementById('main__chat_window')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const chat = document.getElementById('chat');
chat.hidden = true
myVideo.muted = true;

window.onload = () => {
    $(document).ready(function() {
        $("#getCodeModal").modal('show');
    });
}


var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

let myVideoStream;
const peers = {}
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === 'Enter' && text.value != '') {
        socket.emit('messagesend', text.value);
        text.value = ""
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
}

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");

            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (id) => {
            console.log('userid' + id);
            connectToNewUser(id, stream);
        })

        socket.on('user-disconnected', (id) => {
            console.log(peers)
            if (peers[id]) peers[id].close()
        })
    })
peer.on("call", (call) => {
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit('join-room', roomId, id);
})

socket.on("createMessage", (message) => {
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
})

const connectToNewUser = (userId, streams) => {
    const call = peer.call(userId, streams);
    console.log(call);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove()
    })

    peers[userId] = call
}

const cancel = () => {
    $("#getCodeModal").modal('hide');
}

const copy = async() => {
    const roomid = document.getElementById('roomid').innerText
    await navigator.clipboard.writeText('http://localhost:3000/' + roomid)

}
const invitebox = () => {
    $("#getCodeModal").modal('show');
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById('mic').style.color = 'red';
    } else {
        document.getElementById('mic').style.color = 'white';
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(getUserMedia)
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById('video').style.color = 'red';
    } else {
        document.getElementById('video').style.color = 'white';
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
}

const addVideoStream = (videoEl, stream) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    videoGrid.append(videoEl)
};
