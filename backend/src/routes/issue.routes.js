const express = require("express");
const router = express.Router();


//?controller
const issueController=require("../controllers/issue.controller")

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");


//? add issue route
router.post("/add/:groupId", authorizationToken, issueController.addIssue)














module.exports=router;