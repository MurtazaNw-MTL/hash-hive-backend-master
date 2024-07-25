const express = require("express");
const app = express();
let http = require('http')
let socketIO = require('socket.io');
const USER_CONTROLER = require('./controllers/userControler');

let server = http.Server(app);
io = socketIO(server)


io.on('connection', client => {
    // client.on('event', data => { /* … */ });
    client.on('submit', (props) => {
        console.log(props)
        //  Db Query to save timestamp and other details
        saveMiningData(props)
    });
});
const saveMiningData = async (payload) => {
    try {
        // const data = await BaseSchema.create({
        //     ...payload
        // });
        let id = payload.id || "6571b31bbdafa55c7b98572c"
        let walletAmount = payload.walletAmount || 70
        USER_CONTROLER.updateWalletAmount_byMiner(id, walletAmount)

    } catch (error) {
        console.log(error, "<<<")
    }

}
module.exports = { server, app }

