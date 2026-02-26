module.exports.validate = (schema, property = "body") => {
  return (req, res, next) => {

    const { error, value } = schema.validate(req[property], {
       convert: true,
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map(e => e.message)
      });
    }

    req[property] = value;
    next();
  };
};