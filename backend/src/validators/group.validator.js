const joi = require("joi")

module.exports.createGroupSchema = joi.object({
  groupname: joi.string().min(3).max(25).required(),
  description: joi.string().max(250).required(),
  joinapproval: joi.string().valid("open", "request").required(),
  imageuploadpermission: joi.boolean().required()
})