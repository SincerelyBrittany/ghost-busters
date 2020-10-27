const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

let players = [];
const rooms = {};
const state = {};
io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);

    players.push(socket.id);

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        players = players.filter(player => player !== socket.id);
    });

    socket.on('newGame', () => {
        var roomName = makeId(5);
        console.log(roomName);
        rooms[socket.id] = roomName;
        socket.join(roomName);
        socket.emit('newGame', roomName);
    });

    socket.on('joinGame', (roomName) => {
        const room = io.sockets.adapter.rooms[roomName];
        if (room){
            rooms[socket.id] = roomName;
            socket.join(roomName);
            console.log(room.sockets)
            socket.emit('joinGame');
            console.log(`new user ${socket.id} joined room ${socket.room}`);
        } else {
            socket.emit('unknownCode');
        }
    });

    function makeId(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
});



http.listen(3000, function () {
    console.log('Server started!');
});
