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
            socket.emit("findAndJoinMatch",{id:"emfJjWW1gv"},(data)=>{
                if(data.status == ERROR.OK){
                    console.log("finding and joining room")  
                }
            });
            
        }
    });
})
socket2.on("connect",()=>{
    console.log("client2 to lobby connection successful")
    socket2.emit("login",{accountType:"guest",guestToken:"38LACjsxW5"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
            socket2.emit("findAndJoinMatch",{id:"38LACjsxW5"},(data)=>{
                if(data.status == ERROR.OK){
                    console.log("finding and joining room")  
                }
            });
        }
    });
})
socket3.on("connect",()=>{
    console.log("client3 to lobby connection successful")
    socket3.emit("login",{accountType:"guest",guestToken:"K5g4K7ZRb9"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
            socket3.emit("findAndJoinMatch",{id:"K5g4K7ZRb9"},(data)=>{
                if(data.status == ERROR.OK){
                    console.log("finding and joining room")  
                }
            });
        }
    });
})
socket4.on("connect",()=>{
    console.log("client4 to lobby connection successful")
    socket4.emit("login",{accountType:"guest",guestToken:"QRsILEiQf"},(data)=>{
        console.log(data);
        if(data.status == ERROR.OK){
            console.log("new player added to the map")
            socket4.emit("findAndJoinMatch",{id:"QRsILEiQf"},(data)=>{
                if(data.status == ERROR.OK){
                    console.log("finding and joining room")  
                }
            });
            
        }
    });
})
// socket5.on("connect",()=>{
//     console.log("client4 to lobby connection successful")
//     socket5.emit("login",{accountType:"guest",guestToken:"ABCTBBS"},(data)=>{
//         console.log(data);
//         if(data.status == ERROR.OK){
//             console.log("new player added to the map")
//             socket5.emit("findAndJoinMatch",{id:"ABCTBBS"},(data)=>{
//                 if(data.status == ERROR.OK){
//                     console.log("finding and joining room")  
//                 }
//             });
//         }
//     });
// })

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

 socket.on('gameStart',function(data) {
    console.log("game will start in 3 seconds",data)
  });
  socket2.on('gameStart',function(data) {
     console.log("game will start in 3 seconds",data)
     
  });
  socket3.on('gameStart',function(data) {
     console.log("game will start in 3 seconds",data)   
  });
  socket4.on('gameStart',function(data) {
     console.log("game will start in 3 seconds",data)
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

socket.on("turnStart",(data)=>{
    console.log("turn starts for playerId",data.nextTurnId)
    console.log("You have 27 seconds to roll dice");
})
socket2.on("turnStart",(data)=>{
    console.log("turn starts for playerId",data.nextTurnId)
    console.log("You have 27 seconds to roll dice");
})
socket3.on("turnStart",(data)=>{
    console.log("turn starts for playerId",data.nextTurnId)
    console.log("You have 27 seconds to roll dice");
})
socket4.on("turnStart",(data)=>{
    console.log("turn starts for playerId",data.nextTurnId)
    console.log("You have 27 seconds to roll dice");
})