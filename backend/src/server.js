const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Routes
const authRoutes = require("./routes/auth");

//Middlewares
const { authorizationToken } = require("./middlewares/auth.middleware");

//setups
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);
//Mongo connection
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}
//Schemas
const CreateGroup = require("./models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("./models/issue");

//! Routes
app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//! create groups
app.post("/creategroup", authorizationToken, async (req, res, next) => {
  try {
    const {
      groupname,
      description,
      category,
      visibility,
      joinapproval,
      imageuploadpermission,
    } = req.body;
    console.log("working",req.body)
    const newGroup = new CreateGroup({
      groupname,
      description,
      category,
      visibility,
      joinType:joinapproval,
      imageuploadpermission,
      createdBy: req.user.userId,
      members: [req.user.userId],
    });
    await newGroup.save();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//!user pages
app.get("/groups", authorizationToken, async (req, res) => {
  try {
    const allGroups = await CreateGroup.find({}).populate(
      "createdBy",
      "name email",
    );
    const issues = await Issue.find({});
    res.json({ allGroups, issues });
  } catch (err) {
    res.status(500);
  }
});
//!add pages
app.post("/add", authorizationToken, async (req, res, next) => {
  try {
    const { title, description, category, groupId } = req.body;
    const newIssue = new Issue({
      title,
      description,
      category,
      group: groupId,
      createdBy: req.user.userId,
    });
    await newIssue.save();

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//group interface
app.post("/groupinterface", authorizationToken, async (req, res) => {
  try {
    const { groupId } = req.body;
    const issues = await Issue.find({ group: groupId })
      .select("title createdBy  createdAt")
      .populate("createdBy", "name")
    res.json({ issues });
  } catch (err) {
    next(err);
  }
});
// each card of group interface
app.post("/indissue", authorizationToken, async (req, res) => {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId)
      .select("title description createdBy createdAt")
      .populate("createdBy", "name")
    res.json({ issue });
  } catch (err) {
    next(err);
  }
});

//404 route
app.all("/*splat", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
//error middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ message });
});

//server start
app.listen(8080, () => {
  console.log("server started at port 8080");
});
