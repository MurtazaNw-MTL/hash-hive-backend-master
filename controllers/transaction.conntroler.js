const { promises } = require("nodemailer/lib/xoauth2");
const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/transaction.model");
const UserSchema = require("../models/user.model");
const { default: mongoose } = require("mongoose");
const SettingSchema = require("../models/setting.model");
require("dotenv").config();
const { SECRET_KEY } = process.env;
// console.log(SECRET_KEY);
const create = async (req, res) => {
  try {
    const { paymentMode, requestedBy, amount } = req.body;
    let reqField = { paymentMode, requestedBy, amount };
    if (!Validator.validateReqField(reqField, res)) return null;
    let payload = req.body;
    let setting = await SettingSchema.find()
    let min = 5
    min = setting[0].minWithdrawAmount
    if (amount < min) return Response.fail(res, `Minimum withdrawl limit is $${min}`)
    const userData = await UserSchema.findById(req.user._id);

    const { walletAddress, walletAmount } = userData;
    if (walletAmount < amount) {

      return Response.fail(res, `Insufficient balance`, null);
    }
    payload.walletAddress = walletAddress;

    const createTransaction = () => {
      return BaseSchema.create({
        ...req.body
      }).then(res => {
        return true
      }).catch(e => false)
    }

    const handleUserWallet = () => {
      return UserSchema.findByIdAndUpdate(req.user._id, {
        $inc: { walletAmount: -amount, lock: +amount }
      }).then(res => {
        return true
      }).catch(e => false)
    }

    Promise.all([createTransaction(), handleUserWallet()]).then(async result => {
      console.log(result, "<<<<thisisallpromiseresponse")
      if (result[0] && result[1]) {
        let user = await UserSchema.findById(req.user._id)
        Response.success(res, "Withdrawal request sent to admin.", user);
      } else {
        Response.error(res, "Error while saving data", data);
      }
    })



  } catch (error) {
    console.log(error);
    let message = "Error";
    if (error?.keyPattern?.user) message = "Error! You already have account";
    Response.error(res, message, error);
  }
};
const get = async (req, res) => {
  try {
    let filter = { ...req.query };
    let page = 1;
    if (req.query.page) page = req.query.page;

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
    if (req?.query?.search) {
      const searchTerm = req.query.search
      filter = {
        ...filter,
        $or: [
          {
            walletAddress: { $regex: searchTerm, $options: "i" }
          },
          {
            amount: { $regex: searchTerm, $options: "i" }
          },

        ]
      };
    }
    let data = await BaseSchema.find(filter)
      .sort({
        createdAt: -1
      })
      .populate({
        path: "requestedBy",
        populate: {
          path: "account",
          model: "user_account"
        }
      })
      .skip((page - 1) * 10)
      .limit(10);
    if (data.length) Response.success(res, "Data fetched", data);
    else Response.success(res, "No Data found", []);
  } catch (error) {
    Response.error(res, "Error while fetching data", error);
  }
};


const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // if (!requestedBy) return Response.fail(res, "userId(requestedBy) is required");
    if (!id) return Response.fail(res, "id is required");
    if (!status) return Response.fail(res, "Status is required");
    if (status == "PENDING") {
      return Response.error(res, "Status can not be updated to pending", null);
    }
    if (req.body.paymentMode)
      return Response.error(res, "paymentMode can't be updated");

    if (req.body.amount) return Response.fail(res, "amount can't be updated");
    if (req.body.walletAddress)
      return Response.error(res, "Wallet Address can't be updated");
    else {

      let transactionDetail = await BaseSchema.findById(id)
      let userId = transactionDetail.requestedBy.toString()
      let amount = transactionDetail.amount
      let txsStatus = await BaseSchema.findById(id)
      if (txsStatus.status == "APPROVED" || txsStatus.status == "REJECTED") {
        return Response.error(res, "Status can't be updated once approved", {});
      }
      if (status == "APPROVED") {
        const updateTxs = () => {
          return BaseSchema.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
          ).then(res => true).catch(e => false);
        }
        const updateUser = () => {
          return UserSchema.findByIdAndUpdate(
            userId,
            {
              $inc: { lock: -amount }
            },
            { new: true }).then(res => true).catch(e => false);
        }
        Promise.all([updateTxs(), updateUser()]).then(result => {
          console.log(result)
          if (result[0] && result[1]) {
            Response.success(res, "Status Updated", {});
          } else {
            Response.success(res, "Please try after some time", {});
          }
        })
      }
      if (status == "REJECTED") {
        const updateTxs = () => {
          return BaseSchema.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
          ).then(res => true).catch(e => false);
        }
        const updateUser = () => {
          return UserSchema.findByIdAndUpdate(
            userId,
            {
              $inc: { lock: -amount, walletAmount: +amount }
            },
            { new: true }
          ).then(res => true).catch(e => {
            console.log(e)
            return false
          });
        }
        Promise.all([updateTxs(), updateUser()]).then(result => {
          console.log(result)
          if (result[0] && result[1]) {
            Response.success(res, "Status Updated", {});
          } else {
            Response.success(res, "Please try after some time", {});
          }
        }
        )
      }



      // Response.success(res, "Updated", data);
    }
  } catch (error) {
    console.log(error);
    Response.error(res, error.message);
  }
};
const manageTransactiuon = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectMessage } = req.body;
    if (!id) return Response.fail(res, "id is required");
    if (!status) return Response.fail(res, "Status is required");
    if (req.body.paymentMode)
      return Response.fail(res, "paymentMode can't be updated");
    if (req.body.requestedBy)
      return Response.fail(res, "requestedBy can't be updated");
    if (req.body.amount) return Response.fail(res, "amount can't be updated");
    if (req.body.walletAddress)
      return Response.fail(res, "Wallet Address can't be updated");
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
