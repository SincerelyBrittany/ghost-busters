const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);
const { promisify } = require('util');

const sleep = promisify(setTimeout);

let players = {};
var objects = {};
const rooms = {};

io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);

    players[socket.id] = {};

    // update the objects to have the client's state of the sprites
    socket.on('sprites', (sprites) => {
        Object.keys(sprites).forEach(key => {
            var sprite = sprites[key];
            // console.log(`${key} was clicked: ${sprite['clicked']}`);
            objects[key] = sprite;
        })
        // make sure the all the other client objects are updated as well
        socket.emit('updateCandles', objects);
    })
    // communicate that a object/sprite has beeen clicked
    
    socket.on('clicked', (key) => {
        objects[key]['clicked'] = true;
        // tell other users that the specific sprite has been clicked
        socket.broadcast.emit('updateCandles', objects);
    });

    socket.on('newGame', () => {
        var roomName = makeId(5);
        console.log(`user ${socket.id} created room ${roomName}`);
        rooms[socket.id] = roomName;
        socket.join(roomName);
        const room = io.sockets.adapter.rooms[roomName];
        let users = Object.keys(room.sockets);
        // if this socket was the first person in the room,
        // they must have created the room and therefore are the owner/controller
        if (users[0] === socket.id) {
            socket.on('hello', msg => {
                // for some reason this line won't emit unless i have this 'hello' socket on
                io.to(socket.id).emit('isOwner');
            });
        };
        socket.emit('newGame', roomName);
    });

    socket.on('joinGame', (roomName) => {
        const room = io.sockets.adapter.rooms[roomName];
        if (room){
            rooms[socket.id] = roomName;
            socket.join(roomName);
            console.log(room.sockets);
            socket.emit('joinGame');
            console.log(`new user ${socket.id} joined room ${roomName}`);
            socket.to(roomName).emit('newPlayer', socket.id);
            // FOR SOME REASON THIS DOESN'T EMIT :()
            socket.emit('getPlayers', getPlayers());
            // if (room.sockets[0] === socket.id) {
            //     console.log('joinGame owner');
            //     io.to(socket.id).emit('isOwner');
            // };
        } else {
            socket.emit('unknownCode');
        }
    });

    const decTime = async () => {
        for (var i = 30; i >= 0; i--){
            await sleep(1000);
            console.log(`time is: ${i}`);
            io.emit('decTime', (i));
        }
    }

    socket.on('startGame', () => {
        console.log('startGame');
        socket.broadcast.emit('startGame');
        socket.on('decTime', () => {
            decTime();
        });

    })

    socket.on('gameOver', (player, score) => {
        players[player] = {score: score};
        let bestScore = 0
        let winner = ''
        Object.keys(players).forEach((id) => {
            if (players[id]['score'] >= bestScore) {
                winner = id;
            }
        })
        socket.emit('isWinner', winner);
    });

    function getPlayers() {
        var players = [];
        Object.keys(io.sockets.connected).forEach((socketID) => {
            var player = io.sockets.connected[socketID].id;
            
            if(player) {
                players.push(player);
            }
        });
        console.log(players);
        return players;
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

     socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
    });

});

http.listen(3000, function () {
    console.log('Server started!');
});
