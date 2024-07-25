const express = require("express");
const Referral_Controler = require("../controllers/referral.controler");
const Validation = require("../middleware/Validations");

const router = express.Router();

router.post("/create", Referral_Controler.create);
router.get("/get", Referral_Controler.get);
router.get(
  "/get/:referredBy",
  Validation.validateToken,
  Referral_Controler.getReferralTransaction
);
router.put("/update/:id", Referral_Controler.update);
router.put(
  "/update-amount/:id",
  Validation.validateToken,
  Referral_Controler.addReferralAmount
);
router.delete("/delete/:id", Referral_Controler.remove);

module.exports = router;
