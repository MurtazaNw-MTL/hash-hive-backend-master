const express = require("express");
const AUTH_CONTROLER = require("../controllers/auth.controler");
const Validation = require("../middleware/Validations");
const router = express.Router();

router.post("/register", AUTH_CONTROLER.registerUser);
router.post("/login", AUTH_CONTROLER.login);
router.post("/forget", AUTH_CONTROLER.forgetPassword);
router.post("/update-password", AUTH_CONTROLER.updatePassword);
router.get("/otps", AUTH_CONTROLER.getOtp);
router.post("/verify", AUTH_CONTROLER.VerifyOtp);
router.post("/change-pass", AUTH_CONTROLER.changePassword);
router.post("/google", Validation.checkGoogleAuth, AUTH_CONTROLER.googleAuth);
router.get(
  "/session-login",
  Validation.validateToken,
  AUTH_CONTROLER.getOneUser
);

// router.get("/get", );
module.exports = router;
