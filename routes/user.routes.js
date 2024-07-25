const express = require("express");
const Validation = require("../middleware/Validations");
const USER_CONTROLER = require("../controllers/userControler");
const router = express.Router();
const upload = require("../middleware/multer");
router.get(
  "/admin/all",
  Validation.validateToken,
  Validation.verifyAdmin,
  USER_CONTROLER.getAllUser
);
router.get(
  "/referral/:referredBy",
  Validation.validateToken,
  Validation.verifyUser,
  USER_CONTROLER.getAllUser
);

router.get(
  "/profile",
  Validation.validateToken,
  Validation.verifyUser,
  USER_CONTROLER.updateUserDetails
);
router.get(
  "/user-detail-admin/:id",
  Validation.validateToken,
  Validation.verifyAdmin,
  USER_CONTROLER.getSigleUserDetail
);
router.put(
  "/update",
  Validation.validateToken,
  Validation.verifyUser,
  upload.fields([{ name: "image", maxCount: 1 }]),
  USER_CONTROLER.updateUserDetails
);

router.delete(
  "/admin/delete/:id",
  Validation.validateToken,
  Validation.verifyAdmin,
  USER_CONTROLER.deleteUser
);

router.put(
  "/block",
  Validation.validateToken,
  Validation.verifyAdmin,
  USER_CONTROLER.blockUser
);
// router.put(
//   "/admin/verify",
//   Validation.validateToken,
//   Validation.verifyAdmin,
//   USER_CONTROLER.VerifyUser
// );
// router.delete(
//   "/admin/delete-all",
//   Validation.validateToken,
//   Validation.verifyAdmin,
//   USER_CONTROLER.deleteAll
// );

// router.get("/get", );
module.exports = router;
