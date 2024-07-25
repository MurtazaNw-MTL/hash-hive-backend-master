const express = require("express");
const RoadMapRoutes = require("../controllers/roadmap.controler");

const router = express.Router();

router.post("/create", RoadMapRoutes.create);
router.get("/get", RoadMapRoutes.get);
router.put("/update/:id", RoadMapRoutes.update);
router.delete("/delete/:id", RoadMapRoutes.remove);

module.exports = router;
