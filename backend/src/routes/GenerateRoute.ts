import generateSong from "../controllers/GenerateController";

const express1 = require("express");

const router = express1.Router();

// const generateSong = require("../controllers/GenerateController.ts");

router.post("/", generateSong);

module.exports = router;
