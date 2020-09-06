const io = require('socket.io-client');
const { ERROR } = require("./controller/constants.js");
const socket = io("http://localhost:3000");
const socket2 = io("http://localhost:3000");
const socket3 = io("http://localhost:3000");
const socket4 = io("http://localhost:3000");
const socket5 = io("http://localhost:3000");

socket.on("connect",()=>{
    console.log("client1 to lobby connection successful")
    socket.emit("login",{accountType:"guest",guestToken:"emfJjWW1gv"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
        }
    });
})
socket2.on("connect",()=>{
    console.log("client2 to lobby connection successful")
    socket.emit("login",{accountType:"guest",guestToken:"38LACjsxW5"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
        }
    });
})
socket3.on("connect",()=>{
    console.log("client3 to lobby connection successful")
    socket.emit("login",{accountType:"guest",guestToken:"K5g4K7ZRb9"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
        }
    });
})
socket4.on("connect",()=>{
    console.log("client4 to lobby connection successful")
    socket.emit("login",{accountType:"guest",guestToken:"QRsILEiQf"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
        }
    });
})
socket5.on("connect",()=>{
    console.log("client4 to lobby connection successful")
    socket.emit("login",{accountType:"guest",guestToken:"ABCTBBS"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
        }
    });
})


socket.on('connectToRoom',function(data) {
   console.log("connectToRoom",data)
 });
 socket2.on('connectToRoom',function(data) {
    console.log("connectToRoom",data)
    
 });
 socket3.on('connectToRoom',function(data) {
    console.log("connectToRoom",data)
    
 });
 socket4.on('connectToRoom',function(data) {
    console.log("connectToRoom",data)
  
 });


socket.on("disconnect",()=>{
    console.log("client1 to lobby disconnection successful")
})
socket2.on("disconnect",()=>{
    console.log("client2 to lobby disconnection successful")
})
socket3.on("disconnect",()=>{
    console.log("client3 to lobby disconnection successful")
})
socket4.on("disconnect",()=>{
    console.log("client4 to lobby disconnection successful")
})