const joi=require("joi")

module.exports.createIssueSchema=joi.object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().max(1000).required(),
    stayAnonymous:joi.boolean().required()
})