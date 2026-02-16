const express = require("express");
const router = express.Router();


//?controller
const groupController=require("../controllers/group.controller")

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");

//!all routes
//?create group
router.post("/create", authorizationToken, groupController.createGroup);
//?get all groups to home page
router.get("/",authorizationToken,groupController.getAllGroups)
//?search groups globally
router.post("/search",groupController.searchAllGroups)

module.exports=router;