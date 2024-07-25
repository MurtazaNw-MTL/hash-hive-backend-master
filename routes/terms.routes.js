const express = require("express");
const TermsControler = require("../controllers/terms.controler");

const router = express.Router();

router.post("/create", TermsControler.create);
router.get("/get", TermsControler.get);
router.put("/update/:id", TermsControler.update);
router.delete("/delete/:id", TermsControler.remove);

module.exports = router;
