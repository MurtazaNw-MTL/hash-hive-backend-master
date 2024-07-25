const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const FaqSchema = require("../models/faq.model")
require("dotenv").config();

const create = async (req, res) => {
  try {
    const { question, answer } = req.body;
    let reqField = { question, answer };
    if (!Validator.validateReqField(reqField, res)) return null;
    const data = await FaqSchema.create({
      ...reqField
    });
    if (data) {
      Response.success(res, "Data saved", data);
    } else {
      Response.error(res, "Error while saving data", data);
    }
  } catch (error) {
    console.log(error);
    Response.error(res, "Error", error);
  }
};
const get = async (req, res) => {
  try {
    let data = await FaqSchema.find({isActive:true}).sort({
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
      let data = await FaqSchema.findByIdAndUpdate(
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
    const data = await FaqSchema.findByIdAndDelete(id);
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
  remove
};
