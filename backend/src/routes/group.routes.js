const express = require("express");
const router = express.Router();


//?controller
const groupController=require("../controllers/group.controller")

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");

//!user home page routes
//?create group
router.post("/create", authorizationToken, groupController.createGroup);
//?get all groups to home page
router.get("/",authorizationToken,groupController.getAllGroups)
//?search groups globally
router.post("/search",groupController.searchAllGroups)
//?group search request open to join.
router.post("/member/add/:groupid", authorizationToken, groupController.joinSearchedGroups)
//?search joined groups 
//!bug (non joined groups also visible)
router.get("/search/joined", authorizationToken, groupController.searchJoinedGroups)
//?global serach request to join group
router.post("/join/request/:groupId", authorizationToken, groupController.joinGroupRequest)


module.exports=router;