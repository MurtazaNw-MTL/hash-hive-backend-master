const express = require("express");
const Game_Controler = require("../controllers/game.controler");
const Validation = require("../middleware/Validations");
const GamePlayCount_Controler = require("../controllers/gamePlayCount.controler")
const router = express.Router();

router.post("/create", Game_Controler.create);
router.get("/get", Game_Controler.get);
router.put("/update/:id",
    Validation.validateToken,
    Validation.verifyAdmin, Game_Controler.update);
router.delete("/delete/:id", Game_Controler.remove);

// Play routes
router.post("/play-count/create/:gameId", Validation.validateToken, Validation.verifyUser, GamePlayCount_Controler.create);
router.get("/play-count/get/:userId", Validation.validateToken, Validation.verifyAdmin, GamePlayCount_Controler.getCount);
module.exports = router;
