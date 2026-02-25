const express = require("express");
const router = express.Router();
//controller
const authController = require("../controllers/auth.controller")
const { authorizationToken } = require("../middlewares/auth.middleware");


router.post("/signup",authController.signUp)
router.post("/login",authController.login)
router.post("/refreshtoken",authController.refreshToken)  
router.get("/getusername",authorizationToken,authController.getUsername)
//logout user
router.post("/logout",authorizationToken,authController.logout)
module.exports = router;