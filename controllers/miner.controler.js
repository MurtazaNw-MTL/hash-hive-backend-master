const Response = require("../middleware/Response");
const Validation = require("../middleware/Validations");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/miner.model");
const UserSchema = require("../models/user.model");
const paymentControler = require("./payment.controler")
require("dotenv").config();
const { SECRET_KEY } = process.env;


const create = async (payload) => {
    try {
        const { validIdentifiers, globalIdentifier } = payload
        if (!validIdentifiers || !globalIdentifier) return { success: false, message: "validIdentifiers/globalIdentifier is required", data: null }
        const data = await BaseSchema.create(payload);

        if (data) {
            return { success: true, message: "Data saved", data }
        } else {

            return { success: false, message: "Error!", data }
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Error!", data: null }
    }
};

const distributeRewards = async (req, res) => {
    try {
        let startTimeStamp = null
        let endTimeStamp = null
        const newReceivedPayments = await paymentControler.getNewMoneroPayment()
        if (!newReceivedPayments.success) return { success: true, message: newReceivedPayments.message, }
        if (!newReceivedPayments.payments.length) return { success: true, message: "No Payment found", }
        //    ---- If we have new payment which is not distributed among miners
        let previousPaymentAt = newReceivedPayments.previousPaymentAt
        let rewardsDistributed = []
        let paymentSuccessMessage = "SUCCESSFULL"
        for (const payment of newReceivedPayments.payments) {

            // const payment = newReceivedPayments[index];
            startTimeStamp = previousPaymentAt
            endTimeStamp = `${payment.ts}`.length == 13 ? payment.ts : payment.ts * 1000

            // endTimeStamp = (new Date()).getTime()
            const minedData = await getMiningData({ startTimeStamp, endTimeStamp })
            if (!minedData.success) {
                paymentSuccessMessage = minedData.message
                break;
            }
            const totalValidShares = minedData.data.globalBlocks.validShareDiff
            if (!minedData.success) return minedData
            const miningDataGroupByIdentifier = await getMiningDataGroupByIdentifier({ startTimeStamp, endTimeStamp }, totalValidShares, payment.amount)
            if (!miningDataGroupByIdentifier.success) return miningDataGroupByIdentifier
            let payload = {
                "pt": "pplns",
                moneroPaymentTimeStamp: endTimeStamp,
                "amount": payment.amount,
                "txnHash": payment.txnHash,
                "mixin": payment.mixin,
                totalValidShare: totalValidShares,
                identifiers: miningDataGroupByIdentifier.data,
                minedData: minedData.data.globalBlocks
            }

            let paymentCreated = await paymentControler.create(payload)
            if (!paymentCreated.success) {
                paymentSuccessMessage = paymentCreated.message
                break;
            }
            await Promise.all(miningDataGroupByIdentifier.data.map(async idt => {
                console.log(idt.identifier)
                let Amount_10Per = +idt.rewardAmount * 0.1
                let Amount_90Per = +idt.rewardAmount - +Amount_10Per
                let updatedUser = await UserSchema.findByIdAndUpdate(idt.identifier,
                    { $inc: { walletAmount: +Amount_90Per } }, { new: true })
                if (updatedUser.referredBy)
                    await UserSchema.findByIdAndUpdate(updatedUser.referredBy,
                        { $inc: { walletAmount: +Amount_10Per } }, { new: true })
                return updatedUser
            }));
            previousPaymentAt = payload.moneroPaymentTimeStamp
            rewardsDistributed = [...rewardsDistributed, { minedData: { ...minedData.data.globalBlocks, amount: payment.amount }, miningDataGroupByIdentifier: miningDataGroupByIdentifier.data }]
        }

        if (paymentSuccessMessage != "SUCCESSFULL") return { success: false, message: paymentSuccessMessage }
        return { success: true, message: "Reward amount generated", rewardsDistributed }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Error !", data: null }
    }
};
const getMinersDataStats = async (req, res) => {
    try {

        let startTimeStamp = null
        let endTimeStamp = null
        // const newReceivedPayments = await paymentControler.getNewMoneroPayment()
        // if (!newReceivedPayments.success) return { success: true, message: newReceivedPayments.message, }

        let rewardsDistributed = []
        // let paymentSuccessMessage = "SUCCESSFULL"

        // for await (const payment of newReceivedPayments.payments) {
        // const payment = newReceivedPayments[index];
        startTimeStamp = 1707054348
        // endTimeStamp = payment.ts
        endTimeStamp = (new Date()).getTime()


        const minedData = await getMiningData({ startTimeStamp, endTimeStamp })

        const totalValidShares = minedData.data.globalBlocks.validShareDiff
        if (!minedData.success) return minedData
        const miningDataGroupByIdentifier = await getMiningDataGroupByIdentifier({ startTimeStamp, endTimeStamp }, totalValidShares, minedData.data.amount)
        if (!miningDataGroupByIdentifier.success) return miningDataGroupByIdentifier
        const returnData = {
            miningDataGroupByIdentifier: miningDataGroupByIdentifier.data,
            minedData: minedData.data
        }
        return {
            success: true, message: "Reward amount generated", returnData
        }

    } catch (error) {
        console.log(error)
        return { success: false, message: "Error !", data: null }
    }
};


const getAllData = async (req, res) => {
    try {
        let payload = req.query
        let startTimeStamp = null
        let endTimeStamp = null
        startTimeStamp = payload.startTimeStamp
        endTimeStamp = payload.endTimeStamp

        let filter = {}
        if (startTimeStamp && endTimeStamp) {
            filter = {
                timeStamp: {
                    $gte: startTimeStamp,
                    $lte: endTimeStamp
                }
            };
        }

        let data = await BaseSchema.find(filter).sort({
            createdAt: -1
        });
        console.log(startTimeStamp, endTimeStamp)


        if (data.length) {
            return res.status(200).send({ success: true, message: "Data fetched", data })
        }
        else {
            return res.status(200).send({ success: false, message: "No Data found", data: null })
        }
    } catch (error) {
        console.log(error)
        return res.status(200).send({ success: false, message: "Error !", data: null })
    }
};






const getInitialAndLatestBlock = (data) => {
    const sortedData = data.sort((a, b) => b.timeStamp - a.timeStamp)

    const firstBlock = sortedData[sortedData.length - 1] // initial block is in the end of array
    const latestBlock = sortedData[0]  // latest block is in the 0th index of the array
    let validShareDiff = latestBlock.globalIdentifier[0].validShares - firstBlock.globalIdentifier[0].validShares
    return {
        endBlock: latestBlock.globalIdentifier[0],
        firstBlock: firstBlock.globalIdentifier[0],
        validShareDiff
    }
}
const getIdentifierInitialAndLatestBlock = (data) => {
    const sortedData = data.sort((a, b) => b.lts - a.lts)
    const firstBlock = sortedData[sortedData.length - 1] // initial block is in the end of array
    const latestBlock = sortedData[0]  // latest block is in the 0th index of the array
    let validShareDiff = latestBlock.validShares - firstBlock.validShares
    return { validShareDiff, firstBlock, latestBlock }
}

const getMiningData = async (payload) => {
    try {
        let filter = {
            timeStamp: {
                $gte: +payload.startTimeStamp,
                $lte: +payload.endTimeStamp
            }
        };
        const miningData = await BaseSchema.find(filter).sort({
            createdAt: -1
        });
        if (!miningData.length) {
            return {
                success: true, message: "Mining data fetched", data: {
                    miningData: [], globalBlocks: {
                        endBlock: {},
                        firstBlock: {},
                        validShareDiff: 0,
                        ...payload
                    }
                }
            }
        }
        const globalBlocks = getInitialAndLatestBlock(miningData)
        return {
            success: true, message: "Mining data fetched", data: {
                miningData, globalBlocks: { ...globalBlocks, ...payload },
            }
        }
    } catch (error) {
        console.log(error, "Error at getMiningData function ")
        return {
            success: false, message: "Mining data fetched", data: null
        }
    }
}

const getMiningDataGroupByIdentifier = async (payload, totalValidShare, amount) => {
    try {
        let miningDataGroupByIdentifier = await BaseSchema.aggregate([

            {
                $match: {
                    // $and: [
                    timeStamp: { $lte: +payload.endTimeStamp, $gte: +payload.startTimeStamp }
                    // { timeStamp: { $gte: 1709279121322 } },
                    // ],
                }
            },
            {
                $unwind: '$validIdentifiers',
            },
            {
                $group: {
                    _id: '$validIdentifiers.identifer',
                    data: { $push: '$validIdentifiers' },
                },
            },
            {
                $unwind: '$data',
            },
            {
                $group: {
                    _id: '$_id',
                    data: { $push: '$data' },

                },
            },
        ]).sort({ "data.lts": -1 })
        let identifiers = miningDataGroupByIdentifier.map((idt) => {
            const minedBlocks = getIdentifierInitialAndLatestBlock(idt.data)
            const validSharePercentage = minedBlocks.validShareDiff * 100 / totalValidShare
            const rewardAmount = parseInt(validSharePercentage * amount / 100)
            return {
                identifier: idt._id,
                minedBlocks: minedBlocks,
                validSharePercentage,
                rewardAmount
            }
        })
        // let identifierDiff = getIdentifierInitialAndLatestBlock(miningDataGroupByIdentifier)
        return { success: true, message: "Mining Data grouped by Identifier", data: identifiers }
    } catch (err) {
        console.log(err, "error miningDataGroupByIdentifier")
        return { success: false, message: "Error at miningDataGroupByIdentifier" }
    }
}

module.exports = {
    create,
    distributeRewards: distributeRewards,
    getMiningData,

    getAllData,

    getMinersDataStats
};
