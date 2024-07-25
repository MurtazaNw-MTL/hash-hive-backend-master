const express = require("express");
const SettingControler = require("../controllers/setting.controler");
const Validation = require("../middleware/Validations");

const router = express.Router();

router.post("/create", Validation.validateToken,
    Validation.verifyAdmin, SettingControler.create);
router.get("/get", Validation.validateToken, SettingControler.get);
router.put("/update/:id", Validation.validateToken, SettingControler.update);

module.exports = router;
