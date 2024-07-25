const { default: mongoose } = require("mongoose");
const CustomResponse = require("../middleware/Response");
const Response = require("../middleware/Response");
const Validation = require("../middleware/Validations");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/referrals.model");
const UserSchema = require("../models/user.model");
require("dotenv").config();
const { SECRET_KEY } = process.env;
// console.log(SECRET_KEY);
const create = async (payload) => {
  try {
    // const { name, url } = req.body;
    // let reqField = { name, url };
    // if (!Validator.validateReqField(reqField, res)) return null;
    const data = await BaseSchema.create({
      ...payload
    });

    if (data) {
      return data
      // Response.success(res, "Data saved", data);
    } else {
      // Response.error(res, "Error while saving data", data);
    }
  } catch (error) {
    console.log(error);
    Response.error(res, "Error", error);
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
    let data = await BaseSchema.find(filter)
      .populate({ path: "referredTo", select: "email userName" })
      .sort({
        createdAt: -1
      });
    if (data.length) Response.success(res, "Data fetched", data);
    else Response.success(res, "No Data found", []);
  } catch (error) {
    Response.error(res, "Error while fetching data", error);
  }
};

const getReferralTransaction = async (req, res) => {
  try {
    const referredBy = req.user._id;
    let reqField = { referredBy };
    console.log(referredBy);
    if (!Validation.validateReqField(reqField, res)) return null;
    // const data = await BaseSchema.find({ referredBy });
    const data = await BaseSchema.aggregate([
      {
        $match: { referredBy: new mongoose.Types.ObjectId(referredBy) }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    CustomResponse.success(
      res,
      "Earnned Referral Amount amounnt fetched",
      data
    );
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};

const update = async (req, res) => {
  try {
    console.log("here");

    const { id } = req.params;
    if (!Validation.validateReqField({ id }, res)) return null;
    console.log("here");

    // let payload ={...req.body}
    if (req.body.referredTo)
      return Response.fail(res, "referredTo can't be updated");
    if (req.body.referredBy)
      return Response.fail(res, "referredBy can't be updated");
    if (req.body.referralCode)
      return Response.fail(res, "referralCode can't be updated");
    if (!req.body.amount) return Response.fail(res, "amout is required");

    let pyload = req.body;
    pyload.isUpdated = true;
    const checkIfAlreadyUpdated = await BaseSchema.findById(id);
    if (checkIfAlreadyUpdated.isUpdated)
      return CustomResponse.fail(
        res,
        "Amount can'tß be updated more than once"
      );
    let data = await BaseSchema.findByIdAndUpdate(id, pyload, { new: true });
    const userData = await UserSchema.findByIdAndUpdate(
      data.referredBy,
      {
        $inc: { walletAmount: req.body.amount }
      },
      { new: true }
    );
    Response.success(res, "Updated", data);
  } catch (error) {
    console.log(error);
    Response.error(res, error.message);
  }
};
const addReferralAmount = async (req, res) => {
  try {
    // here id is usersID whome amount need to be updated
    const { id, amount } = req.body;
    const reqField = { id, amount };
    if (!Validation.validateReqField(reqField, res)) return null;
    const data = await UserSchema.findByIdAndUpdate(id, {
      $inc: { amount: amount }
    });
    if (data) CustomResponse.success(res, "Amount added", data);
    else CustomResponse.fail(res, "Error while updating value", data);
  } catch (error) {
    CustomResponse.fail(res, "error", error);
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
  addReferralAmount,
  update,
  remove,
  getReferralTransaction
};
