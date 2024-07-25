const express = require("express");
const AboutUsControler = require("../controllers/aboutus.controler");

const router = express.Router();

router.post("/create", AboutUsControler.create);
router.get("/get", AboutUsControler.get);
router.put("/update/:id", AboutUsControler.update);
router.delete("/delete/:id", AboutUsControler.remove);

module.exports = router;
