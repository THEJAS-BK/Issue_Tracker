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

//?global search open to join.
router.post("/member/add/:groupid", authorizationToken, groupController.joinSearchedGroups)

//?global search request to join group
router.post("/join/request/:groupId", authorizationToken, groupController.joinGroupRequest)

//?search joined groups 
//!bug (non joined groups also visible)
router.get("/search/joined", authorizationToken, groupController.searchJoinedGroups)


//!group interface code

//? get groups in user interface
router.get("/interface/:groupId", authorizationToken, groupController.getGroupUserInterface)

//?get all members in group user interface
router.get("/members/:groupId", authorizationToken, groupController.getGroupUserInterfaceMembers)

//?search all group members in user interface
router.get("/members/search/:groupId", authorizationToken, groupController.searchGroupMembersUserInterface)



module.exports=router;