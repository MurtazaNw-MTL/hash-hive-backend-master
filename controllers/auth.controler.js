const User = require("../models/user.model");
const Referrral = require("../models/referrals.model");
const Validation = require("../middleware/Validations");
const CustomResponse = require("../middleware/Response");
const bcrypt = require("bcrypt");
const sendEmail = require("../middleware/nodemailer");
const OtpSchema = require("../models/otp.model");
const UserSchema = require("../models/user.model");
const { SendGrid } = require("../middleware/Sendgrid");
function generateOTP() {
  // Generate a random 4-digit number
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}

const getHashedVal = async pass => {
  let encryptPass = await bcrypt.hash(pass, 10);
  return encryptPass;
};
const generateReferral = email => {
  function gfg() {
    var minm = 10000;
    var maxm = 99999;
    const down = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    return down;
  }
  const first2 = email[0] + email[1] + gfg();
  return first2;
};

const registerUser = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase()
    const { email, password, referredBy } = req.body;
    let reqFields = {
      email,
      password
    };
    //  VALIDATE FIELD
    if (!Validation.validateReqField(reqFields, res)) return null;

    //  CHECK PASSWORD LENGTH
    let validatePass = Validation.password(password);
    if (typeof validatePass == "string")
      return CustomResponse.fail(res, validatePass, null);

    req.body.password = await getHashedVal(password);

    let payload = {
      ...req.body,
      referralCode: generateReferral(email),
      loginMethod: "EMAIL_PASSWORD"
    };
    let referredByUser = null;
    // referredBy User is
    if (req.body.referredBy) {
      referredByUser = await User.findOne({ referralCode: referredBy });
      if (!referredByUser)
        return CustomResponse.fail(res, "Invalid referral code");
      else {
        payload = {
          ...payload,
          referredBy: referredByUser._id
        };

        let newUser = new User(payload);
        let newReferral = new Referrral({
          referralCode: referredBy,
          referredTo: newUser._id,
          referredBy: referredByUser._id
        });
        newUser.registeredReferral = newReferral._id;

        await newUser.save();
        await newReferral.save();
        // ----referral

        await User.findByIdAndUpdate(referredByUser._id, {
          $push: {
            referrals: newReferral._id
          }
        });
        let sendThisUser = { ...newUser._doc };
        delete sendThisUser.password;
        let token = await Validation.generateToken({
          _id: sendThisUser._id,
          email: sendThisUser.email,
          role: sendThisUser.role
        });
        CustomResponse.success(res, "User Created", {
          ...sendThisUser,
          token: token,
          newReferral
        });
      }
    } else {
      let newUser = new User(payload);
      console.log(newUser, "<<<thisisnewuser");
      const saveIt = await newUser.save();
      let sendThisUser = { ...newUser._doc };
      delete sendThisUser.password;
      if (saveIt) {
        let token = await Validation.generateToken({
          _id: sendThisUser._id,
          email: sendThisUser.email,
          role: sendThisUser.role
        });

        CustomResponse.success(res, "User Created", {
          ...sendThisUser,
          token: token
        });
      } else CustomResponse.fail(res, "Failed", null);
    }

    // ------referral

    // else CustomResponse.fail(res,)
  } catch (error) {
    // console.log(error.code, error.keyPattern.hasOwnProperty("email") ? `User already exist with given email address` : "Something went wrong!")

    if (error.code == 11000) CustomResponse.error(res, error.keyPattern.hasOwnProperty("email") ? `User already exist with given email address` : "Something went wrong!")
    else CustomResponse.error(res, error.message)

  }
};
const googleAuth = async (req, res) => {
  try {
    const { email, fullName, image } = req.query.user;
    const { role } = req.body;

    let reqFields = { email, userName: fullName, role };
    //  VALIDATE FIELD
    if (!Validation.validateReqField(reqFields, res)) return null;
    // check if user exist
    let existUser = await User.findOne({ email });

    if (existUser) {
      let token = await Validation.generateToken({
        _id: existUser._id,
        email: existUser.email,
        role: existUser.role
      });
      return CustomResponse.success(res, "Login Successful", {
        ...existUser._doc,
        token
      });
    }

    let payload = {
      email,
      userName: fullName,
      profileImage: image,
      referralCode: generateReferral(email),
      loginMethod: "GOOGLE"
    };
    let referredByUser = null;
    // referredBy User is
    if (req.body.referredBy) {
      referredByUser = await User.findOne({ referralCode: referredBy });
      if (!referredByUser)
        return CustomResponse.fail(res, "Invalid referral code");
      else {
        payload = {
          ...payload,
          referredBy: referredByUser._id
        };

        let newUser = new User(payload);
        let newReferral = new Referrral({
          referralCode: referredBy,
          referredTo: newUser._id,
          referredBy: referredByUser._id
        });
        newUser.registeredReferral = newReferral._id;

        await newUser.save();
        await newReferral.save();
        // ----referral

        await User.findByIdAndUpdate(referredByUser._id, {
          $push: {
            referrals: newReferral._id
          }
        });
        let sendThisUser = { ...newUser._doc };
        delete sendThisUser.password;
        let token = await Validation.generateToken({
          _id: sendThisUser._id,
          email: sendThisUser.email,
          role: sendThisUser.role
        });
        CustomResponse.success(res, "User Created", {
          ...sendThisUser,
          token: token,
          newReferral
        });
      }
    } else {
      let newUser = new User(payload);
      console.log(newUser, "<<<thisisnewuser");
      const saveIt = await newUser.save();
      let sendThisUser = { ...newUser._doc };
      delete sendThisUser.password;
      if (saveIt) {
        let token = await Validation.generateToken({
          _id: sendThisUser._id,
          email: sendThisUser.email,
          role: sendThisUser.role
        });

        CustomResponse.success(res, "User Created", {
          ...sendThisUser,
          token: token
        });
      } else CustomResponse.fail(res, "Failed", null);
    }

    // ------referral

    // else CustomResponse.fail(res,)
  } catch (error) {
    CustomResponse.error(res, error.message);
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    const reqField = { email, password };
    if (!Validation.validateReqField(reqField, res)) return null;
    email = email.trim().toLowerCase()
    let splitemail = email.split("@")
    const sanitizedInput = splitemail[0].replace(/[^a-zA-Z0-9.]/g, '') + "@" + splitemail[1];

    const users = await User.aggregate([
      {
        $match: {
          email: sanitizedInput
        },
      },

    ])
    if (!users.length)
      return CustomResponse.fail(res, "Invalid Email / Password", null);
    const matchPass = await bcrypt.compare(password, users[0].password);
    if (!matchPass)
      return CustomResponse.unauthorized(res, "Invalid Email / Password");

    let userData = users[0]
    const token = await Validation.generateToken({
      _id: userData._id,
      email: userData.email,
      role: userData.role
    });
    delete userData.password;
    CustomResponse.success(res, "Login Successfull", { ...userData, token });
  } catch (error) {
    console.log(error, "<<<thisisuser")
    CustomResponse.error(res, error.message, null);
  }
};
const login1 = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase()
    const { email, password } = req.body;
    const reqField = { email, password };
    if (!Validation.validateReqField(reqField, res)) return null;


    let user = await User.findOne({
      email
    });
    if (!user)
      return CustomResponse.fail(res, "Invalid Email / Password", null);
    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass)
      return CustomResponse.unauthorized(res, "Invalid Email / Password");

    let userData = { ...user._doc };
    const token = await Validation.generateToken({
      _id: userData._id,
      email: userData.email,
      role: userData.role
    });
    delete userData.password;
    CustomResponse.success(res, "Login successfull", { ...userData, token });
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};

const getUser = (req, res) => {
  CustomResponse.success(res, "message", []);
};

const getOneUser = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return CustomResponse.fail(res, "User does not exist", null);
    let userData = { ...user._doc };
    delete userData.password;
    CustomResponse.success(res, "User Fetched", userData);
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return CustomResponse.fail(res, "Email is required", null);
    // if (!id) return CustomResponse.fail(res, "User ID is required", null);
    let user = await User.findOne({ email })
    if (!user) return CustomResponse.fail(res, "User does not exist!", null);
    let id = user._id

    const otp = generateOTP();
    // const sedMail = await sendEmail(email, otp);
    const sedMail = await SendGrid.SendEmail(email, otp);
    if (sedMail) {
      const generateOtp = await OtpSchema.create({ sentTo: id, otp: otp });
      if (generateOtp) {
        CustomResponse.success(
          res,
          "Recover code sent to " + email,
          generateOtp
        );
      }
    } else {
      CustomResponse.fail(res, "Error while sending Email", null);
    }
  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, id } = req.body;
    if (!currentPassword) return CustomResponse.fail(res, "Current Password is required", null);
    if (!newPassword) return CustomResponse.fail(res, "New Password is required", null);
    if (!id) return CustomResponse.fail(res, "New Password is required", null);
    console.log(req.body);
    let user = await UserSchema.findById(id)

    // let updated = await UserSchema.findByIdAndUpdate(id, { password: encryptPass })
    // console.log(user, currentPassword);
    const matchPass = await bcrypt.compare(currentPassword, user.password);
    if (currentPassword == newPassword) return CustomResponse.fail(res, "Current password & new password must be different", null)
    // console.log(matchPass);
    if (matchPass) {
      let encryptPass = await getHashedVal(newPassword)
      await UserSchema.findByIdAndUpdate(id, { password: encryptPass })
      return CustomResponse.success(res, "Password successfully updated", null)
    }
    // let updated = await UserSchema.findByIdAndUpdate(id, { password: newPassword })
    return CustomResponse.fail(res, "current password is incorrect", null)



  } catch (error) {
    CustomResponse.error(res, error.message, null);
  }
};
const changePassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    if (!id) return CustomResponse.fail(res, " User Id is required", null);
    if (!newPassword)
      return CustomResponse.fail(res, "newPassword is required");
    const user = await UserSchema.findById(id);
    if (!user) return CustomResponse.fail(res, "Invalid user");
    else {
      //  CHECK PASSWORD LENGTH
      let validatePass = Validation.password(newPassword);
      if (typeof validatePass == "string")
        return CustomResponse.fail(res, validatePass, null);

      const hashedPass = await getHashedVal(newPassword);
      const changed = await UserSchema.findByIdAndUpdate(
        id,
        { password: hashedPass },
        { new: true }
      );
      if (changed) CustomResponse.success(res, "Password Changed", null);
      else CustomResponse.fail(res, "Error while updating password");
    }
  } catch (error) {
    console.log(error);
    CustomResponse.error(res, "error", error);
  }
};

const VerifyOtp = async (req, res) => {
  try {
    const { otp, otpId } = req.body;
    if (!otpId) return CustomResponse.fail(res, "OTP ID is required");
    if (!otp) return CustomResponse.fail(res, "OTP is required");
    const otpData = await OtpSchema.findById(otpId);

    if (!otpData) return CustomResponse.fail(res, "Invalid OTP ID", null);
    if (otpData.otp != otp) return CustomResponse.fail(res, "Invalid otp", null);
    else {
      const verifyId = await OtpSchema.findByIdAndDelete(otpId);
      CustomResponse.success(res, "Verification Successful", null);
    }
  } catch (error) {
    CustomResponse.error(res, error.response, error);
  }
};
const getOtp = async (req, res) => {
  try {
    const data = await OtpSchema.find({ ...req.query }).populate("sentTo");
    CustomResponse.success(res, "Data Sent", data);
  } catch (error) {
    CustomResponse.error(res, error.response, error);
  }
};

const AUTH_CONTROLER = {
  registerUser,
  get: getUser,
  login: login,
  getOneUser,
  forgetPassword,
  updatePassword,
  getOtp,
  VerifyOtp,
  changePassword,
  googleAuth
};
module.exports = AUTH_CONTROLER;
