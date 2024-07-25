const cron = require('node-cron');
const { getAllWorkers } = require('./monero.controler');
const MinerControler = require("./miner.controler");
const minerControler = require('./miner.controler');

const saveWorkersHistory = () => {
    try {
        // Running in every 60 seconds
        cron.schedule('*/60 * * * * *', async () => {
            let date = new Date()
            let showTime = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            let data = await getAllWorkers()
            let currTimeStamp = date.getTime()
            const dataSavedInDb = await MinerControler.create({ ...data, timeStamp: currTimeStamp })
            console.log('Cron job is running every 60 seconds---', showTime, "--\n");
            // Add your cron job logic here
        });
    } catch (error) {
        console.log(error)
    }

}
const distributeRewards = () => {
    try {
        //Sunday of every week
        cron.schedule('0 0 * * 0', async () => {
            let date = new Date()
            let showTime = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
            console.log("----\n\n Reward Distribution Job running every week --- ", showTime)
            let data = await minerControler.distributeRewards()
            console.log({ success: data, message: data.message })

        });
    } catch (error) {
        console.log(error)
    }

}
const distributeRewards2 = async () => {
    try {
        // cron.schedule('0 */3 * * *', async () => {
        let date = new Date()
        let showTime = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
        console.log("----\n\n test data--- ", showTime)
        let data = await minerControler.distributeRewards()
        console.log({ success: data, message: data.message })

        // });
    } catch (error) {
        console.log(error)
    }

}
// distributeRewards2()
saveWorkersHistory()
distributeRewards()