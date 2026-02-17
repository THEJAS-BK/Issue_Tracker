const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Routes
const authRoutes = require("./routes/auth.routes");
const groupRoutes=require("./routes/group.routes");
const issueRoutes = require("./routes/issue.routes")

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
const Group = require("./models/group");
const ExpressError = require("./utils/ExpressError");
const Issue = require("./models/issue");
//uitls


//! Routes
app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//? groups
app.use("/groups",groupRoutes);
//?issues
app.use("/issues",issueRoutes);
//!!! admin routes
//!search join request
app.get(
  "/join/request/:groupId/admin/search",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const val = req.query.q;
      if (!groupId || !val) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await Group.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      const requests = await Group.findById(groupId)
        .select("joinRequests")
        .populate("joinRequests.userId", "name");

      const regex = new RegExp(val, "i");
      const members = requests.joinRequests.filter((mem) => {
        return regex.test(mem.userId.name);
      });

      res.json(members);
    } catch (err) {
      next(err);
    }
  },
);

//404 route
app.all("/*splat", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
//error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.message || "Something went wrong";

  // log unexpected errors
  if (!err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
});


//server start
app.listen(8080, () => {
  console.log("server started at port 8080");
});
