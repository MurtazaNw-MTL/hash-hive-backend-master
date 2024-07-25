const express = require("express");
const SupportControler = require("../controllers/support.controler");
const Validation = require("../middleware/Validations");

const router = express.Router();

router.post("/create", SupportControler.create);
router.get("/get", SupportControler.get);
router.put(
  "/update/:id",
  Validation.validateToken,
  Validation.verifyAdmin,
  SupportControler.update
);
router.delete("/delete/:id", SupportControler.remove);

module.exports = router;
