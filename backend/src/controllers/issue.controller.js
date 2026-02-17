const mongoose =require("mongoose")

//?schemas
const Group = require("../models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("../models/issue");

//!add issue to the group
module.exports.addIssue=async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { title, description, stayAnonymous } = req.body;
    const newIssue = new Issue({
      title,
      description,
      stayAnonymous,
      group: groupId,
      createdBy: req.user.userId,
    });
    await newIssue.save();

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
//!get edit issue page
module.exports.getEditIssuePage= async (req, res, next) => {
  try {
    const { issueId } = req.params;
    if (!issueId) return res.sendStatus(400);

    const issue = await Issue.findById(issueId).select(
      "title description stayAnonymous",
    );
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}
//!confirm edited issue change
module.exports.confirmEditIssue= async (req, res, next) => {
  try {
    const { issueId } = req.params;
    if (!issueId) return res.sendStatus(400);

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    const checkIssue = await Issue.findById(issueId).select("createdBy");

    if (!mongoose.Types.ObjectId.isValid(issueId)) return res.sendStatus(404);

    if (checkIssue.createdBy.toString() !== curUser) return res.sendStatus(403);

    const { title, description, stayAnonymous } = req.body;
    await Issue.findByIdAndUpdate(issueId, {
      title,
      description,
      stayAnonymous,
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}