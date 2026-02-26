const joi = require("joi")
module.exports.signupSchema=joi.object({
    name:joi.string().required(),
    email:joi.string().required().email(),
    password:joi.string().required()

})
module.exports.loginSchema=joi.object({
    email:joi.string().required().email(),
    password:joi.string().required()
})