const { request } = require("express");
const USER_CONTROLER = require("./userControler");
// let addressAkshay = "42sjaxzL2iX9vaPoVLPvmydFunsPvMU4nP8x5NHzmvdvCkyn4RZdqUZSkEFvxuSvkMVTX1wf9TyMfdQwm5rZhA7TCpJ9DBj"
// let addressHashHive = "43ScpqW9m21WkrNL6PgqZ3aGHzECqtnAZdBDP883WETU3P2pgnRE7LiDBDMaW6Dk1p8m4mTCto4ZF4zv87VpUaxV2tNQ6L9"
const moneroAddress = process.env.MoneroAddress

const MONERO_URL = "https://api.moneroocean.stream/miner/" + moneroAddress + "/"
function filterObjectsWithValidShares(inputObject) {
    const filteredObjects = Object.values(inputObject).filter(obj => obj.identifer != "global" && obj.validShares > 0);
    return filteredObjects;
}
const getAllWorkers = async (req, res) => {
    try {
        let url = MONERO_URL + "stats/allWorkers"
        let data = await (await fetch(url)).json()
        let globalIdentifier = data.global
        let validIdentifiers = filterObjectsWithValidShares(data)
        return ({ globalIdentifier, validIdentifiers })
    } catch (error) {
        console.log(error)
    }
}
const getPayment = async (req, res) => {
    try {

        let url = MONERO_URL + "payments"
        let data = await (await fetch(url)).json()
        res.status(200).send({
            data
        })

    } catch (error) {
        console.log(error)
    }
}
const getIdentifiers = async (req, res) => {
    try {

        let url = MONERO_URL + "identifiers"

        let data = await (await fetch(url)).json()
        res.status(200).send({
            data
        })

    } catch (error) {
        console.log(error)
    }
}
const getStats = async (req, res) => {
    try {


        let url = MONERO_URL + "stats"

        let data = await (await fetch(url)).json()
        res.status(200).send({
            data
        })

    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    getAllWorkers,
    getPayment,
    getIdentifiers,
    getStats
}