export function formDataParser(...fields) {
  return (req, res, next) => {
    fields.forEach((val) => {
      req.body[val] = JSON.parse(req.body[val]);
    });
    return next();
  };
}

// console.log(formDataParser("openSchedule", "closeSchedule", "openTime", "closeTime"))
