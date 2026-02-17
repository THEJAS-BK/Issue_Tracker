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












module.exports=router;