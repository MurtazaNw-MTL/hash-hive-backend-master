const express = require("express");
const Minro_Controler = require("../controllers/miner.controler");

const router = express.Router();

// router.post("/create", Minro_Controler.create);
router.get("/get", Minro_Controler.getAllData);
router.get("/get-mine-data", async (req, res) => {
    let payload = {
        ...req.query
    }
    console.log(payload.startTimeStamp)
    let data = await Minro_Controler.getMiningData(payload)
    res.status(200).send({ success: true, data })
});
router.post("/distribute-rewards", async (req, res) => {
    let data = await Minro_Controler.distributeRewards()
    res.status(200).send({ success: true, data })
});
router.get("/get-by-time", Minro_Controler.distributeRewards);
router.get("/get-for-test", async (req, res) => {
    let data = await Minro_Controler.getMinersDataStats()
    res.status(200).send(data)
});
// router.put("/update/:id", Minro_Controler.update);
// router.delete("/delete/:id", Minro_Controler.remove);

module.exports = router;
