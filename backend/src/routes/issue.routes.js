const express = require("express");
const router = express.Router();


//?controller
const issueController=require("../controllers/issue.controller")

//middlewares
const { authorizationToken } = require("../middlewares/auth.middleware");


//? add issue route
router.post("/add/:groupId", authorizationToken, issueController.addIssue)

//? get edit page route
router.get("/edit/:issueId", authorizationToken, issueController.getEditIssuePage)

//? confirm edited issue route
router.patch("/edit/:issueId", authorizationToken, issueController.confirmEditIssue)

//?search issue in group interface
router.get("/search", authorizationToken, issueController.searchIssueInGroupUserInterface)

//? get complete details abt issue and render it on the right side
router.get("/details/:issueid", authorizationToken, issueController.getIssueDetailsUserInterface)

//?filter issues. all,pending,in progress,resolved in user interface
router.get("/filter/:groupId", authorizationToken, issueController.filterIssuesInGroupUserInterface)

//?delete issue by the owner in user interface
router.delete("/delete/:issueId", authorizationToken, issueController.deleteIssueByOwner)







module.exports=router;