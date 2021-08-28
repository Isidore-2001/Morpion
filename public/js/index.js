window.addEventListener('load',initForm);
var socket = io();



const player={
    host : '',
    playerCell : '',
    roomId : null,
    username : '',
    socketId : '',
    symbol : "X",
    turn : false,
    win : false
}




function initForm(){
  
  document.forms.form.addEventListener("submit", sendForm1);
  //.forms.form.addEventListener("submit", sendForm2);
  
}



let roomsCard = document.getElementById("rooms-card");
let roomsList = document.getElementById("rooms-list");
let restartarea = document.getElementById("restart-area");
let message = document.getElementById("turn-message");
let game = document.getElementById("game-card");

let link = document.getElementById("link");
let linkId = document.getElementById("link-to-share");
    let usercard = document.getElementById("user-card");
    const usernameJ = document.getElementById("username");
//var socket = io();
let wattingarea = document.getElementById("waiting-area");


restartarea.addEventListener('click', ()=>restartGame());
function sendForm1(ev){

    ev.preventDefault();
    let username = document.getElementById("username");
    let usercard = document.getElementById("user-card");
    let watting = document.getElementById("rooms-card");
    
    
    player.username = username.value;
    
    player.turn =true;
    player.host = true;
    player.socketId = socket.id;
    usercard.hidden = true;
    watting.classList.remove("d-none");
    wattingarea.classList.remove("d-none");

    



socket.emit(
    'playerData', 
        player,
  )}
  
  ;

  socket.on('join room', (data)=>{
    linkId.innerHTML += `<a href="${window.location.href}?room=${data}" target="_blank">${window.location.href}?room=${data}</a>`;
    player.roomId = data;
  })



socket.emit('get rooms');


let cells = document.getElementsByClassName("cell");


function play(ev){
   //console.log(player);
    //console.log(this.innerText === "" && player.turn);
    let id=  this.getAttribute("id");
    
    if (this.innerText === "" && player.turn){
     //player.win = calculateWin(id);
     player.playerCell = id;
     player.turn = false;
     this.innerHTML = player.symbol;
     
     socket.emit("play", player);
    }
   // console.log(player)
    
 };

for (let cell of cells){
cell.addEventListener("click", play)};



socket.on('play', (ennemyPlayer) => {
    console.log(player);
    if (ennemyPlayer.socketId !== player.socketId){
       // console.log("jeeeeeeeeeeeeeee1");
        const playerCell = document.getElementById(`${ennemyPlayer.playerCell}`);
        playerCell.classList.add("text-danger");
        playerCell.innerHTML+="O";
        let win = calculateWin(playerCell.getAttribute("id"), "O");
        if (win){
            ennemyPlayer.win = true;
        }
        if (ennemyPlayer.win){
            setMessage("alert-info", "alert-danger", `C'est ${ennemyPlayer.username} qui vient de gagner`);
            
        }

        else if (calculateEquality()){
            setMessage("alert-info", "alert-warning", `C'est l'égalité`);
        }

        //console.log(playerCell.getAttribute("id"));


        

        else{

    setMessage('alert-info', 'alert-success', "c'est ton tour de jouer");
    player.turn = true;}

    }

    else{
        //console.log("jeeeeeeeeeeeeeeeeeeeee2");
        const playerCell = document.getElementById(`${player.playerCell}`);
        let win = calculateWin(playerCell.getAttribute("id"), "X");
        if (win){
            player.win = true;
        }
        if (player.win){
            setMessage("alert-info", "alert-success", `Félicitations vous avez gagné`);
            //calculateWin(playerCell.playerCell, "");
        }

        else if (calculateEquality()){
            setMessage("alert-info", "alert-warning", `C'est l'égalité`);
        }

       else{ setMessage('alert-success', 'alert-info', `c'est le tour de ${ennemyPlayer.username} tour de jouer`);
        player.turn = false;
    }

    }

   
});


socket.on('list room', rooms=>{
    //console.log(rooms);

    let html = "";


    if (rooms.length > 0){
        //console.log("jeeeeeeeeeeeeeeeeee");
        rooms.forEach(element => {
            if (element.players.length !== 2){
                html += `<li class="list-group-item d-flex justify-content-between">
                            <p class="p-0 m-0 flex-grow-1 fw-bold">Salon de ${element.players[0].username} - ${element.roomId}</p>
                            <button class="btn btn-sm btn-success join-room" data-room="${element.roomId}">Rejoindre</button>
                        </li>`
            }
            
        });
    }

    if (html !== ""){
        roomsCard.classList.remove('d-none');
        roomsList.innerHTML = html;
    }

    for (let element of document.getElementsByClassName("join-room")){
        element.addEventListener("click", joinRoom);
 
    }
});

function startgame(players){
    //console.log("jeeeeeeeeeeeeeeeeee");
    
    message.classList.remove("d-none");
    game.classList.remove("d-none");
    wattingarea.classList.add("d-none");
    restartarea.classList.remove("d-none");
    link.hidden= true;
    roomsCard.classList.add("d-none");
    let ennemie = players.find(r => r.socketId !== player.socketId);
    let ennemieusername = ennemie.username;
    if (player.host && player.turn){
        setMessage('alert-info', 'alert-success', "C'est ton tour de jouer");
    }
    else{
        setMessage( 'alert-success','alert-info', `C'est le tour de ${ennemieusername} tour de jouer`);
    }
}

socket.on("start game", (players)=>{
    startgame(players);
});


function setMessage(classa, classb, messageT){
    message.classList.remove(classa);
    message.classList.add(classb);
    
    message.innerHTML = messageT;
};


function joinRoom(ev){

    
    if (usernameJ.value !== ""){
        player.username = usernameJ.value;
        player.roomId = this.dataset.room;
        
        player.socketId = socket.id;


        socket.emit('playerData', player);
        usercard.hidden = true;
        
        roomsCard.classList.add("d-none");
        wattingarea.classList.remove("d-none");
        

    }
}

function calculateEquality(){
    res = true;
    for (let cell of document.getElementsByClassName("cell")){
        console.log(cell.innerHTML);
        if (cell.innerText === ""){
            
            res = false;
        }
    }
    return res;
}

function restartGame(players = null){
    

    if (!player.host){
        player.turn = false;
        //socket.emit('play again', player.roomId);
    }
    else{
        player.turn  = true;
    }

    if (!players){
        socket.emit('play again', player.roomId);
    }

    

    const cell = document.getElementsByClassName("cell");

    for (let c of cell){
        c.innerHTML = "";
        c.classList.remove("win-cell");
        c.classList.remove("text-danger");

    }
    message.classList.remove('alert-danger');
    message.classList.remove('alert-warning');
    //message.classList.remove('alert-success');
    

    player.win = false;
    

    //
    if (players){
        console.log(players);
        startgame(players);
    }
    
}

socket.on('playAgain', (data)=>{
    console.log("play Again");
    restartGame(data);
})


function calculateWin(playedCell, symbol = player.symbol) {
    

    colonne = playedCell[playedCell.length-1];
    ligne = playedCell[playedCell.length-3];
    // 1) VERTICAL (check if all the symbols in clicked cell's column are the same)
    let win = true;

    for (let i = 1; i < 4; i++) {
        
        let cell = document.getElementById(`cell-${i}-${parseInt(colonne)}`);
        console.log(cell.value);
        if (cell.textContent !== symbol) {
            win = false;
        }
    }

    if (win) {
        //column = 1;
        
        for (let i = 1; i < 4; i++) {
            let cell = document.getElementById(`cell-${i}-${parseInt(colonne)}`);
            cell.classList.add("win-cell");
        }

        return win;
    }

    // 2) HORIZONTAL (check the clicked cell's row)
    
    win = true;
    for (let i = 1; i < 4; i++) {
        let cell = document.getElementById(`cell-${parseInt(ligne)}-${i}`);
        if (cell.textContent !== symbol) {
            win = false;
        }
    }

    if (win) {
        for (let i = 1; i < 4; i++) {
            let cell = document.getElementById(`cell-${parseInt(ligne)}-${i}`);
            cell.classList.add("win-cell");
        }

        return win;
    }

    // 3) MAIN DIAGONAL (for the sake of simplicity it checks even if the clicked cell is not in the main diagonal)

    win = true;

    for (let i = 1; i < 4; i++) {
        let cell = document.getElementById(`cell-${parseInt(i)}-${i}`);
        if (cell.textContent !== symbol) {
            win = false;
        }
    }

    if (win) {
        for (let i = 1; i < 4; i++) {
            let cell = document.getElementById(`cell-${parseInt(i)}-${i}`);
            cell.classList.add("win-cell");
        }

        return win;
    }

    // 3) SECONDARY DIAGONAL

    win = false;
    
    if (document.getElementById("cell-1-3").textContent === symbol) {
        if (document.getElementById("cell-2-2").textContent === symbol) {
            if (document.getElementById("cell-3-1").textContent === symbol) {
                win = true;

                document.getElementById("cell-1-3").classList.add("win-cell");
                document.getElementById("cell-2-2").classList.add("win-cell");
               document.getElementById("cell-3-1").classList.add("win-cell");

                return win;
            }
        }
    }
}