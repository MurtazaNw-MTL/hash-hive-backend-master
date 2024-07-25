const express = require("express");
const Payment_Controler = require("../controllers/payment.controler");

const router = express.Router();

router.post("/create", Payment_Controler.create);
router.get("/get", Payment_Controler.get);
router.put("/update/:id", Payment_Controler.update);
router.delete("/delete/:id", Payment_Controler.remove);

module.exports = router;
