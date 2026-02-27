const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
// Routes
const authRoutes = require("./routes/auth.routes");
const groupRoutes=require("./routes/group.routes");
const issueRoutes = require("./routes/issue.routes")

//setups
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.ORIGIN,
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
//utils
const ExpressError = require("./utils/ExpressError");

//! Routes
app.get("/hel", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//? groups
app.use("/groups",groupRoutes);
//?issues
app.use("/issues",issueRoutes);
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
