const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload")

//?controller
const issueController=require("../controllers/issue.controller")

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");
const {isPartOfGroup}=require("../middlewares/memvalidation");
const {isPartOfGroupByIssueId}=require("../middlewares/memvalidation")
const { isAdminOrCoAdminByIssueId } = require("../middlewares/memvalidation");
const {isAdminOrCoAdmin} =require("../middlewares/memvalidation")

//? add issue route
router.post("/add/:groupId", authorizationToken,isPartOfGroup,upload.single("issue-image"), issueController.addIssue)

//? get edit page route
router.get("/edit/:issueId", authorizationToken,isPartOfGroupByIssueId, issueController.getEditIssuePage)

//? confirm edited issue route
router.patch("/edit/:issueId", authorizationToken,isPartOfGroupByIssueId,upload.single("issue-image"), issueController.confirmEditIssue)

//?search issue in group interface
router.get("/search", authorizationToken,isPartOfGroup, issueController.searchIssueInGroupUserInterface)

//? get complete details abt issue and render it on the right side
router.get("/details/:issueId", authorizationToken,isPartOfGroupByIssueId, issueController.getIssueDetailsUserInterface)

//? route to check if image upload is allowed for issues
router.get("/imageUploadAllowed/:groupId", authorizationToken,isPartOfGroup, issueController.checkIfImageUploadIsAllowed)

//?filter issues. all,pending,in progress,resolved in user interface
router.get("/filter/:groupId", authorizationToken,isPartOfGroup, issueController.filterIssuesInGroupUserInterface)

//?delete issue by the owner in user interface
router.delete("/delete/:issueId", authorizationToken,isPartOfGroupByIssueId, issueController.deleteIssueByOwner)

/*

admin page issues code

*/
//?get issues rendered in left side
router.get("/details/:issueId/admin", authorizationToken,isPartOfGroupByIssueId,isAdminOrCoAdminByIssueId, issueController.getIssuesInAdminPage)

//?mark as read in admin page
router.post("/:issueId/update/admin", authorizationToken,isPartOfGroupByIssueId,isAdminOrCoAdminByIssueId, issueController.markIssueAsReadInAdminPage)

//?delete issues by admin/coadmin privilages
router.delete("/:issueId/delete/admin", authorizationToken,isPartOfGroupByIssueId,isAdminOrCoAdminByIssueId, issueController.deleteIssueByAdmin)

//?get data for history tab of each user
router.get("/:userId/logs/history", authorizationToken,isPartOfGroup,isAdminOrCoAdmin, issueController.getHistoryTabData)


module.exports=router;