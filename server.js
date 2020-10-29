const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

let players = [];
var objects = {};
const rooms = {};

io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);

    players.push(socket.id);

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

    // socket.on('updateObj', (isOwner, key, x, y) => {
    //     if (!isOwner) {
    //         objects[key]['currentX'] = x;
    //         objects[key]['currentY'] = y;
    //         // objects[key]['velX'] = velX;
    //         // objects[key]['velY'] = velY;
    //         socket.emit('objUpdated', isOwner, objects[key], key)
    //     }
    // });

    socket.on('newGame', () => {
        var roomName = makeId(5);
        console.log(`user ${socket.id} created room ${roomName}`);
        rooms[socket.id] = roomName;
        socket.join(roomName);
        const room = io.sockets.adapter.rooms[roomName];
        socket.emit('newGame', roomName);
        let usersInRoom = Object.keys(room.sockets);
        if (usersInRoom[0] === socket.id) {
            console.log('newGame owner');
            // WHY ISN"T THIS WORKING
            io.to(socket.id).emit('isOwner');
        };
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
        players = players.filter(player => player !== socket.id);
    });

});

http.listen(3000, function () {
    console.log('Server started!');
});
