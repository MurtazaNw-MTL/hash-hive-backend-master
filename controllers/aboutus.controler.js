const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/aboutUs.model");
require("dotenv").config();
const { ABOUT_PAGE_ID } = process.env;

const create = async (req, res) => {
  try {
    const { title, content } = req.body;
    let reqField = { title, content };
    if (!Validator.validateReqField(reqField, res)) return null;
    const data = await BaseSchema.create({
      ...req.body
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
    let filter = { ...req.query, _id: ABOUT_PAGE_ID };

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
  remove
};
