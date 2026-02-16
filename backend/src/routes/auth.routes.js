const express = require("express");
const router = express.Router();
//controller
const authController = require("../controllers/auth.controller")

router.post("/signup",authController.signUp)
router.post("/login",authController.login)
router.post("/refreshtoken",authController.refreshToken)  


module.exports = router;