
const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/setting.model");
require("dotenv").config();
const { SECRET_KEY } = process.env;
// console.log(SECRET_KEY);
const create = async (req, res) => {
    try {
        let existingData = await BaseSchema.find()
        if (existingData.length) {
            return Response.error(res, "Setting can not be created")
        }

        const data = await BaseSchema.create({
            ...req.body
        });
        if (data) {
            return Response.success(res, "Data saved", data);
        } else {
            return Response.error(res, "Error while saving data", data);
        }
    } catch (error) {
        console.log(error);
        Response.error(res, "Error", error);
    }
};
const get = async (req, res) => {
    try {
        let data = await BaseSchema.find(req.query);
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


module.exports = {
    create,
    get,
    update,

};
