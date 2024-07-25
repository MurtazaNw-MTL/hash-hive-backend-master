const User = require("../models/user.model");
const Validation = require("../middleware/Validations");
const CustomResponse = require("../middleware/Response");
const UserSchema = require("../models/user.model");
const uploadOnCloudinary = require("../middleware/cloudinary");
const ReferralSchema = require("../models/referrals.model");
const ReferralControler = require("../controllers/referral.controler")
// const ReferralControler = require("../")
const Response = CustomResponse;

const getAllUser = async (req, res, next) => {
  try {
    console.log("usersss");
    let page = 1;
    if (req.query.page) page = req.query.page;
    // console.log(page);
    // CustomResponse.success(res, "asdf", []);
    const searchTerm = req.query.search;
    let filter = req.query;
    if (req.query.search) {
      filter = {
        ...filter,
        $or: [
          {
            firstName: { $regex: searchTerm, $options: "i" }
          },
          {
            lastName: { $regex: searchTerm, $options: "i" }
          },
          {
            mobileNumber: { $regex: searchTerm, $options: "i" }
          },
          {
            email: { $regex: searchTerm, $options: "i" }
          }
        ]
      };
    }
    let users = await User.find(filter)
      .sort({ createdAt: -1 })
      .populate("referrals")
      .populate("account")
      .skip((page - 1) * 10)
      .limit(10);
    // console.log("asdf");
    if (!users.length) return CustomResponse.success(res, "No User Found", null);
    CustomResponse.success(res, "User Fetched", users);
  } catch (error) {
    console.log(error);
  }
};
const getAllReferral = async (req, res, next) => {
  try {
    console.log("usersss");
    let page = 1;
    if (req.query.page) page = req.query.page;
    // console.log(page);
    // CustomResponse.success(res, "asdf", []);
    const searchTerm = req.query.search;
    let filter = req.query;
    if (req.query.search) {
      filter = {
        ...filter,
        $or: [
          {
            firstName: { $regex: searchTerm, $options: "i" }
          },
          {
            lastName: { $regex: searchTerm, $options: "i" }
          },
          {
            mobileNumber: { $regex: searchTerm, $options: "i" }
          },
          {
            email: { $regex: searchTerm, $options: "i" }
          }
        ]
      };
    }
    let users = await User.find(filter)
      .sort({ createdAt: -1 })
      .populate("referrals")
      .populate("account")
      .skip((page - 1) * 10)
      .limit(10);
    // console.log("asdf");
    if (!users.length) return CustomResponse.fail(res, "No User Found", null);
    CustomResponse.success(res, "User Fetched", users);
  } catch (error) {
    console.log(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    let page = 1;
    if (req.query.page) page = req.query.page;

    const searchTerm = req.query.search;
    let filter = req.query;
    if (req.query.search) {
      filter = {
        ...filter,
        $or: [
          {
            fullName: { $regex: searchTerm, $options: "i" }
          },
          {
            userName: { $regex: searchTerm, $options: "i" }
          },
          {
            mobileNumber: { $regex: searchTerm, $options: "i" }
          },
          {
            email: { $regex: searchTerm, $options: "i" }
          }
        ]
      };
    }
    let users = await User.findById(req.query.user._id)
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(10);
    // console.log("asdf");
    if (!users.length) return CustomResponse.fail(res, "No User Found", null);
    CustomResponse.success(res, "User Fetched", users);
  } catch (error) { }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!Validation.validateReqField({ userId: id }, res)) return null;

    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser)
      return CustomResponse.fail(res, "Error while deleting User");
    CustomResponse.success(res, "User Deleted", null);
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};

const blockUser = async (req, res, next) => {
  const id = req.body.id;
  const { status, message } = req.body;
  if (
    !Validation.validateReqField(
      { userId: id, status: status, message: message },
      res
    )
  )
    return null;

  let blockUser = await User.findByIdAndUpdate(id, {
    isBlocked: {
      status: req.body.status,
      message: req.body.message
    }
  });
  if (!blockUser.isBlocked.status) {
    CustomResponse.success(res, "User Blocked", null);
  }
  else if (blockUser.isBlocked.status) {
    CustomResponse.success(res, "User Unblocked", null);
  }
  else {
    CustomResponse.fail(res, "Error while blocking the user", null);
  }
};

const verifyUser = async (req, res, next) => {
  const id = req.body.id;
  const { status } = req.body;
  console.log(status);
  if (!Validation.validateReqField({ userId: id, status: status }, res))
    return null;

  let blockUser = await User.findByIdAndUpdate(id, {
    isVerified: status
  });
  if (blockUser) {
    CustomResponse.success(res, "Status Updated", null);
  } else {
    CustomResponse.fail(res, "Error while Updating the user", null);
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    let image = null;
    if (req?.files?.image?.length) image = req.files.image[0];
    let link = null
    if (image != null) {
      link = await uploadOnCloudinary(image);
      console.log(link, "<<<tisis image")
    }
    let id = req.user._id;
    if (!id) return CustomResponse.fail(res, "Error while updating", null);
    if (req.body.email)
      return CustomResponse.fail(res, "EMAIL can't be updated");
    if (req.body.password)
      return CustomResponse.fail(res, "Password can't be updated");
    if (req.body.role) return CustomResponse.fail(res, "Role can't be updated");
    if (req.body.walletAmount) return CustomResponse.fail(res, "walletAmount can't be updated");
    // if (req.body.mobileNumber)
    //   return CustomResponse.fail(res, "Mobile Number can't be updated");
    // if (req.body.referredBy)
    //   return CustomResponse.fail(res, "referredBy can't be updated");
    // if (req.body.referralCode)
    //   return CustomResponse.fail(res, "Referral Code can't be updated");
    if (req.body.loginMethod)
      return CustomResponse.fail(res, "Login Method can't be updated");
    if (req.body.isBlocked)
      return CustomResponse.fail(res, "Invalid Fields, can't be updated");
    let payload = { ...req.body }
    if (link) {
      payload = { ...payload, profileImage: link }
    }
    console.log(req.body)
    let referredByUser = null

    if (req?.body?.referredBy) {

      referredByUser = await User.findOne({ referralCode: req.body?.referredBy });
      if (!referredByUser) return CustomResponse.fail(res, "Invalid referral code");
      else {
        payload = {
          ...payload,
          referredBy: referredByUser._id
        };
      }

    }
    const updatedData = await User.findByIdAndUpdate(id, payload, {
      new: true
    });


    if (!updatedData)
      return CustomResponse.fail(res, "Error while updating data", null);
    CustomResponse.success(res, "User data updated", updatedData);
    if (referredByUser) {
      let referralsUpdated = await User.findByIdAndUpdate(referredByUser._id, {
        $push: {
          referrals: updatedData._id
        }
      }, { new: true })

      let createReferral = await ReferralControler.create({ referredTo: updatedData._id, referredBy: referredByUser._id, referralCode: req.body?.referredBy })
    }

    // if(!Validation.validateReqField({userId}))
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};
const updateWalletAmount_byMiner = async (id, walletAmount, res) => {
  try {
    const updatedData = await User.findByIdAndUpdate(id, {
      $inc: { walletAmount: +walletAmount }
    }, {
      new: true
    });
    if (res)
      if (!updatedData)
        return CustomResponse.fail(res, "Error while updating data", null);
    CustomResponse.success(res, "User data updated", updatedData);
    // if(!Validation.validateReqField({userId}))
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};
const deleteAll = async (req, res) => {
  try {
    await User.deleteMany(req.query);
    CustomResponse.success(res, "Users Deleted", null);
  } catch (error) {
    console.log(error);
    CustomResponse.error(res, error.message, null);
  }
};

const getSigleUserDetail = async (req, res) => {
  try {
    console.log(req.params);
    if (!req.params.id) return Response.fail(res, "Id is required", null);
    console.log("here");
    const data = await UserSchema.findById(req.params.id)
      .populate({
        path: "referrals",
        populate: {
          path: "referredTo",
          model: "user"
        }
      })
      .populate("account")
      .populate("registeredReferral")
      .populate("referredBy");
    CustomResponse.success(res, "User Fetched", data);
  } catch (error) {
    console.log("error", error);
    Response.error(res, "Error", error);
  }
};

const USER_CONTROLER = {
  getAllUser,
  deleteUser,
  blockUser,
  updateUserDetails,
  updateWalletAmount_byMiner,
  deleteAll,
  getSigleUserDetail,
  VerifyUser: verifyUser
};

module.exports = USER_CONTROLER;
