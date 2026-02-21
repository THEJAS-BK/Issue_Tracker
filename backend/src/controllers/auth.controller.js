const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
//cookie option
const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path:"/"
};

module.exports.signUp = async (req, res, next) => {
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
};
module.exports.login = async (req, res, next) => {
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
    const accessToken = jwt.sign(
      { userId: curUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5s",
      },
    );
    const refreshToken = jwt.sign(
      { userId: curUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );
    //storing refresh token in db
    curUser.refreshToken = refreshToken;
    await curUser.save();
    //storing Tokens in cookie
    res
      .cookie("accessToken", accessToken, {
        ...cookieOption,
        maxAge: 16*60*1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOption,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    //sending success status
    res.sendStatus(200);
  } catch (err) {
    next(err); //internal server error
  }
};
module.exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    res.cookie("accessToken", newAccessToken, {
      ...cookieOption,
      maxAge: 15 * 60 * 60 * 1000,
    });
    return res.sendStatus(200);
  });
};
//!send username
module.exports.getUsername = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ username: user.name });
  } catch (err) {
    next(err);
  }
};