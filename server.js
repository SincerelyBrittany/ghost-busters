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

    socket.on('newGame', handleNewGame);
    
    function handleNewGame() {
        var roomName = makeId(5);
        console.log(roomName);
        rooms[socket.id] = roomName;
        // state[roomName] = initGame();
        socket.join(roomName);
        return roomName;
    }

    socket.on('joinGame', handleJoinGame);
    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];
        console.log('room' + room.length)
        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numSockets = 0;
        if (allUsers) {
            numSockets = Object.keys(allUsers).length;
        }

        if (numSockets === 0) {
            socket.emit('unknownCode');
        return;
        } else if (numClients > 1) {
            socket.emit('tooManyPlayers');
        return;
        }

        rooms[socket.id] = roomName;

        socket.join(roomName);
        socket.number = 2;
    }
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
