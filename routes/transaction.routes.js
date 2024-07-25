const express = require("express");
const TransactionRoutes = require("../controllers/transaction.conntroler");
const Validation = require("../middleware/Validations");
const UserSchema = require("../models/user.model");
const USER_CONTROLER = require("../controllers/userControler");

const router = express.Router();

router.post("/create", Validation.validateToken, TransactionRoutes.create);
router.get("/get", Validation.validateToken, TransactionRoutes.get);
router.put("/update/:id", Validation.validateToken, TransactionRoutes.update);
router.delete("/delete/:id", Validation.validateToken, TransactionRoutes.remove);
router.put("/update-by-miner/:id", Validation.validateToken, (req, res) => {
    USER_CONTROLER.updateWalletAmount_byMiner(req.params.id, req.body.walletAmount, res)
});

module.exports = router;
