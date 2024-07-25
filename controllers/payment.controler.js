const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/payments.model");
require("dotenv").config();
let address = process.env.MoneroAddress
const MONERO_URL = "https://api.moneroocean.stream/miner/" + address + "/"
// console.log(SECRET_KEY);

const getNewMoneroPayment = async () => {
    try {
        let url = MONERO_URL + "payments"
        let data = await (await fetch(url)).json()
        const latestPayment = await BaseSchema.findOne().sort({ createdAt: -1 });
        if (!latestPayment) {
            let newReceivedPayments = data.sort((a, b) => a.ts - b.ts)
            // newReceivedPayments.push({
            //     pt: 'pplns',
            //     ts: 1709620312000,
            //     amount: 2837023718,
            //     txnHash: '1ccc6e3e2a1629311d54000aa6aaabcea2606de23deb84eeae0f8116d62f565a',
            //     mixin: 15
            // })

            return {
                success: true,
                previousPaymentAt: 1704434559000,
                payments: newReceivedPayments
            }
        }

        if (data.length && latestPayment.moneroPaymentTimeStamp == data[0].ts) {
            return { success: false, message: "No new reward received" }
        }
        let newReceivedPayments = (data.filter(item => item.ts > latestPayment.moneroPaymentTimeStamp)).sort((a, b) => b.ts - a.ts)
        let previousPaymentAt = latestPayment.moneroPaymentTimeStamp
        // let endTime = (new Date()).getTime()
        return {
            success: true,
            previousPaymentAt: previousPaymentAt,
            payments: newReceivedPayments
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error at getNewMoneroPayment"
        }
    }
}
const create = async (payload) => {
    try {
        const paymentResponse = await BaseSchema.create(payload);
        return { success: true, message: "Successfull", data: paymentResponse }


    } catch (error) {
        console.log(error);
        return { success: false, message: "Error", data: null }
    }
};
const get = async (req, res) => {
    try {
        let filter = { ...req.query };

        console.log(filter, "<<<filter");
        if (req.query.search) {
            console.log(req.query);
            const searchTerm = req.query.search;
            filter = {
                ...filter,
                $or: [
                    {
                        name: { $regex: searchTerm, $options: "i" }
                    }
                ]
            };
        }
        let data = await BaseSchema.find(filter).sort({
            createdAt: -1
        });
        if (data.length) Response.success(res, "Data fetched", data);
        else Response.success(res, "No Data found", []);
    } catch (error) {
        Response.error(res, "Error while fetching data", error);
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return Response.fail(res, "id is required");
        else {
            let data = await BaseSchema.findByIdAndUpdate(
                id,
                { ...req.body },
                { new: true }
            );
            Response.success(res, "Updated", data);
        }
    } catch (error) {
        console.log(error);
        Response.error(res, error.message);
    }
};
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return Response.fail(res, "id is requried", null);
        const data = await BaseSchema.findByIdAndDelete(id);
        if (data) Response.success(res, "Query Deleted", null);
        else Response.fail(res, "Error while deleting", null);
    } catch (error) {
        console.log(error);
        Response.error(res, error.message);
    }
};

module.exports = {
    create,
    get,
    update,
    remove,
    getNewMoneroPayment: getNewMoneroPayment
};
