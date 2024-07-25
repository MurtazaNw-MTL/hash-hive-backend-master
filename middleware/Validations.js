var jwt = require("jsonwebtoken");
require('dotenv').config()
const CustomResponse = require("./Response");
const User = require("../models/user.model");
const { OAuth2Client } = require("google-auth-library");
const { JWT_SECRET, CLIENT_TOKEN } = process.env;
const client = new OAuth2Client();
// console.log(CLIENT_TOKEN, "<<<client token");

const checkGoogleAuth = async (req, res, next) => {
  try {
    console.log("here");
    const authHeader = req.body.google_token;

    const ticket = await client.verifyIdToken({
      idToken: authHeader,
      audience: CLIENT_TOKEN // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload);
    req.query.user = {
      email: payload.email,
      image: payload.picture,
      fullName: payload.name
    };

    // Here, you can check payload.sub to identify the user and perform further actions.
    next();
  } catch (error) {
    console.error("Error verifying Google token:", error);
    CustomResponse.error(res, "Invalid google auth", null);

    return null;
  }
};

const validateReqField = (fields, res) => {
  try {
    let flag = true;
    for (const key in fields) {
      const element = fields[key];
      const valid =
        element == "undefined" || element == undefined ? false : true;
      if (!valid) {
        res.status(400).send({ success: false, message: `${key} is required` });
        flag = false;
        break;
      }
    }
    return flag;
  } catch (error) { }
};
const checkPassword = password => {
  // Regular expression pattern
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // Check if the password contains at least one special character
  if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  // Check if the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  // Check if the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  // Check if the password contains at least one numeric digit
  if (!/\d/.test(password)) {
    return "Password must contain at least one numeric digit.";
  }

  // If all requirements are met, return true (password is valid)
  return true;

  return passwordPattern.test(password);
};

const generateToken = async data => {
  console.log("------> thisis jwt----", JWT_SECRET);
  let token = await jwt.sign(data, JWT_SECRET);
  return token;
};

const decodeToken = async (req, res, next) => {
  try {
    const authHeader = String(req.headers["authorization"] || "");
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7, authHeader.length);
      var decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } else if (authHeader.startsWith("Google ")) {
      const ticket = await client.verifyIdToken({
        idToken: req.query.google_auth,
        audience: CLIENT_TOKEN // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      console.log(payload);
      req.query.user = {
        email: payload.email,
        image: payload.picture,
        fullName: payload.name
      };

      // Here, you can check payload.sub to identify the user and perform further actions.
      next();
    } else {
      CustomResponse.unauthorized(res, "Please Login", {
        sessionExpired: "true"
      });
    }
  } catch (error) {
    CustomResponse.unauthorized(
      res,
      // "API is secured with a token-based authentication mechanism.",
      "Session Expired!. Plese login again",
      null
    );
  }
};

const verifyAdmin = async (req, res, next) => {
  let { role } = req.user;
  console.log(req.user.role);
  if (role == "ADMIN") {
    next();
  } else {
    CustomResponse.unauthorized(res, "You are not authorized to access API");
  }
};

const verifyUser = async (req, res, next) => {
  const { role, _id } = req.user;
  console.log(req.user);
  let user = await User.findById(_id);
  if (!user) return CustomResponse.fail(res, "Invalid User", null);
  if (user.isBlocked.status == true) {
    CustomResponse.unauthorized(res, "You have been blocked by the admin");
  } else if (role == "USER") {
    next();
  } else {
    CustomResponse.unauthorized(res, "You are not authorized to access API");
  }
};
// const checkLogedInUser = async (req, res, next) => {
//   const { role, _id } = req.user;
//   console.log(req.user);
//   let user = await User.findById(_id);
//   if (!user) return CustomResponse.fail(res, "Invalid User", null);
//   if (user.isBlocked.status == true) {
//     CustomResponse.unauthorized(res, "You have been blocked by the admin");
//   } else if (role == "USER") {
//     next();
//   } else {
//     CustomResponse.unauthorized(res, "You are not authorized to access API");
//   }
// };

const Validation = {
  validateReqField,
  password: checkPassword,
  generateToken,
  validateToken: decodeToken,
  verifyAdmin,
  verifyUser,
  checkGoogleAuth
};

module.exports = Validation;
