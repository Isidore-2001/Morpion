const express = require('express');
var PORT = process.env.PORT || 3000
var php = require('php');
const app = express();
const path = require('path');
const http = require('http');


const server = http.createServer(app);


let rooms = [];
const {Server} = require('socket.io');

const io = new Server(server);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/bootstrap/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/bootstrap/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(php.express('public/'));

 
app.get('/', function(req, res) {
	res.sendFile(__dirname + "/templates/" + "index.html");
  });
/*
  var exec = require("child_process").exec;
  app.get('/games/morpion', function(req, res){exec("php morpion.php", function (error, stdout, stderr) {res.send(stdout);});});
*/
/*
  app.get('/games/morpion', function(req, res) {
    res.sendFile(__dirname + "/templates/games/" + "morpion.html");
    });*/

    app.post('/games/morpion', function(req, res) {
        var user_name = req.body.username;
        //console.log(user_name);
        res.end("yes");
        });


    const roomId = ()=>{
        return Math.random().toString(36).substring(2,9);
    }
    const createRoom = player =>{
        let room = {roomId : roomId(), players : []};
        player.roomId = room.roomId;
        room.players.push(player);
        rooms.push(room);
        console.log("room")
        return room;
    };

    
    io.on('connection' , (socket)=>{
        console.log(`${socket.id} est connecté`);
        //console.log(roomId());
        socket.on('playerData' , (player)=>{
            console.log(`${player.username} vient d'être en ligne`);
            let room = null;

            if(player.roomId === null){
                room = createRoom(player);
                console.log(`le joueur ${player.username} est dans le salon ${player.roomId}`)
                //console.log(player);
                //socket.emit("join", player);
            }
            else{
                room = rooms.find(element => element.roomId === player.roomId);
                //console.log(room);
                if(room === null){
                    console.log('Pas de salon trouvé');
                    return false;
                }
                
                room.players.push(player);
                
            }
            
            socket.join(player.roomId);
            io.sockets.to(socket.id).emit('join room', player.roomId);
           // console.log(room);
            if(room.players.length === 2){
                
                io.sockets.to(room.roomId).emit('start game', room.players);
                

            }
            socket.on('play', (player)=>{
                /**
                 * 
                 * socket.on("join", (joueur) =>{
                    player.roomId = joueur.roomId});
                **/
                //player.roomId = room.roomId;
                io.sockets.to(room.roomId).emit('play', player);
                //console.log(player);
            });

            socket.on('play again', (roomId)=>{
                room = rooms.find(r => r.roomId === roomId);
                if (room && room.players.length === 2){
                    io.sockets.to(room.roomId).emit('playAgain', room.players);
                }
            })
            
        }


        
        
        
        )
        
        socket.on('get rooms', ()=>{
            //console.log('jeeeeeeeeeeeeeeeeee');
            socket.emit('list room', rooms);
        });
        
   socket.on('disconnect', ()=>{
            console.log(`l'utilisateur ${socket.id} déconnecté`);
            let room = null;

            rooms.forEach( element => {
                element.players.forEach(
                    r => {
                        if (r.socketId === socket.id && r.host){
                            room = element;
                            let t =[];
                           rooms.forEach(
                               elt=>{
                                   if (elt !== room){
                                       t.push(elt);
                                   }
                               }
                           );
                           rooms = t;
                        }
                    }
                )
                
            });
        });

        console.log(rooms);
    });

    


 server.listen((PORT),()=>{
     console.log('Listen on https:\\localhost:3000/')
 });   