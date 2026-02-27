const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
//cookie option

module.exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // create tokens immediately
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.json({ success: true, accessToken, refreshToken });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "User already exists" });
    }
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
        expiresIn: "15m",
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
    //sending success status
    res.json({ success: true, accessToken, refreshToken });
  } catch (err) {
    next(err); //internal server error
  }
};
module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.headers.authorization;
  if (!refreshToken) return res.sendStatus(401);

  const token =refreshToken.split(" ")[1];

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, payload) => {
      if (err) return res.sendStatus(403);

      const curUser = await User.findById(payload.userId);
 
      if (!curUser || curUser.refreshToken !== token) {
        return res
          .status(403)
          .json({ error: "User not found or invalid refresh token" });
      }

      const newAccessToken = jwt.sign(
        { userId: payload.userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        },
      );
      const newRefreshToken = jwt.sign(
        { userId: payload.userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        },
      );
      curUser.refreshToken = newRefreshToken;
      await curUser.save();
      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    },
  );
};
//!logout user
module.exports.logout = async (req, res, next) => {
  try {
    const user = req.user.userId;
    if(!user){
      return res.status(401).json({ error: "Unauthorized" });
    }
    const curUser = await User.findById(user);
    if (!curUser) {
      return res.status(404).json({ error: "User not found" });
    }
    curUser.refreshToken = null;
    await curUser.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
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
