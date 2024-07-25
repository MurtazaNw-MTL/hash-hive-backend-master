const express = require("express");
const FaqControler = require("../controllers/faq.controler");
const Validation = require("../middleware/Validations");

const router = express.Router();

router.post("/create", Validation.validateToken, Validation.verifyAdmin, FaqControler.create);
router.get("/get", Validation.validateToken, FaqControler.get);
router.put("/update/:id", Validation.validateToken, Validation.verifyAdmin, FaqControler.update);
router.delete("/delete/:id", Validation.validateToken, Validation.verifyAdmin, FaqControler.remove);

module.exports = router;
