const express = require("express");
const router = express.Router();
const upload=require("../middlewares/upload");

//?controller
const groupController = require("../controllers/group.controller");

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");

//!user home page routes
//?create group
router.post("/create", authorizationToken,upload.single("group-profile"), groupController.createGroup);

//?get all groups to home page
router.get("/", authorizationToken, groupController.getAllGroups);

//?search groups globally
router.post("/search", groupController.searchAllGroups);

//?global search open to join.
router.post(
  "/member/add/:groupid",
  authorizationToken,
  groupController.joinSearchedGroups,
);

//?global search request to join group
router.post(
  "/join/request/:groupId",
  authorizationToken,
  groupController.joinGroupRequest,
);

//?search joined groups
//!bug (non joined groups also visible)
router.get(
  "/search/joined",
  authorizationToken,
  groupController.searchJoinedGroups,
);

//!group user interface code

//? get groups in user interface
router.get(
  "/interface/:groupId",
  authorizationToken,
  groupController.getGroupUserInterface,
);

//?get all members in group user interface
router.get(
  "/members/:groupId",
  authorizationToken,
  groupController.getGroupUserInterfaceMembers,
);

//?search all group members in user interface
router.get(
  "/members/search/:groupId",
  authorizationToken,
  groupController.searchGroupMembersUserInterface,
);

//?exit group
router.delete(
  "/leave/:groupId",
  authorizationToken,
  groupController.exitGroup,
);

//! group admin interface code

//? get admin page
router.get("/:groupid/admin", authorizationToken, groupController.getAdminPage);

//? get edit group page by admin
router.get(
  "/edit/:groupId/admin",
  authorizationToken,
  groupController.getEditGroupByAdminPage,
);
//? confirm edit group by admin
router.patch(
  "/update/:groupId/admin",
  authorizationToken,
  upload.single("group-profile"),
  groupController.updateGroupByAdmin,
);

//? delete group by admin
router.delete(
  "/delete/:groupId/admin",
  authorizationToken,
  groupController.deleteGroupByAdmin,
);

//! options

//? get all members in admin dashboard
router.get(
  "/members/:groupId/admin",
  authorizationToken,
  groupController.getGroupMembersAdminPage,
);
//? search members inadmin dashboard
router.get(
  "/members/search/:groupId/admin",
  authorizationToken,
  groupController.searchGroupMembersAdminPage,
);

//?promotion to co-admin logic
router.put(
  "/members/promote/:groupId/:userId/admin",
  authorizationToken,
  groupController.promoteToCoAdmin,
);

//?demotion to member logic
router.put(
  "/members/demote/:groupId/:userId/admin",
  authorizationToken,
  groupController.demoteToMember,
);

//? kick member from group logic
router.delete(
  "/members/kick/:groupId/:userId/admin",
  authorizationToken,
  groupController.kickMemberFromGroup,
);

//?render all join requests
router.get(
  "/join/request/:groupId/admin",
  authorizationToken,
  groupController.getJoinRequestsForAdmin,
);

//?accept join requests
router.post(
  "/join/request/:userId/admin",
  authorizationToken,
  groupController.acceptJoinRequest,
);

//?decline join request
router.delete(
  "/join/request/:userId/admin",
  authorizationToken,
  groupController.declineJoinRequest,
);

//?search join request
router.get(
  "/join/request/:groupId/admin/search",
  authorizationToken,
  groupController.searchJoinRequestsForAdmin,
);

module.exports = router;
