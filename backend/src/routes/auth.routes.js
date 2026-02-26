const express = require("express");
const router = express.Router();
//controller
const authController = require("../controllers/auth.controller")
const { authorizationToken } = require("../middlewares/auth.middleware");

const {validate}=require("../middlewares/validate")
const {signupSchema}=require("../validators/signup.validator")
const {loginSchema}=require("../validators/signup.validator")
router.post("/signup",validate(signupSchema),authController.signUp)
router.post("/login",validate(loginSchema),authController.login)
router.post("/refreshtoken",authController.refreshToken)  
router.get("/getusername",authorizationToken,authController.getUsername)
//logout user
router.post("/logout",authorizationToken,authController.logout)
module.exports = router;