const express = require("express");
const PrivacyCotroler = require("../controllers/privacy.controler");

const router = express.Router();

router.post("/create", PrivacyCotroler.create);
router.get("/get", PrivacyCotroler.get);
router.put("/update/:id", PrivacyCotroler.update);
router.delete("/delete/:id", PrivacyCotroler.remove);

module.exports = router;
