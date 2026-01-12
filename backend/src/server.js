const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

//Middlewares
const { authorizationToken } = require("./middlewares/auth.middleware");

//setups
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5500",
  })
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
const User = require("./models/user");

//! Routes

app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});

// Auth section
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const curUser = await User.findOne({ email });
    if (!curUser) {
      return res.sendStatus(401); //user not found
    }
    const isMatch = await bcrypt.compare(password, curUser.password);
    if (!isMatch) {
      return res.sendStatus(401); //Invalid credentials
    }
    // Tokenization
    const val = jwt.sign(
      { userId: curUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
     //success status
    res.sendStatus(200);
  } catch (err) {
    next(err); //internal server error
  }
});

//error middleware
app.use((err, req, res, next) => {
  res.sendStatus(err.status || 500);
});
//server start
app.listen(8080, () => {
  console.log("server started at port 8080");
});
