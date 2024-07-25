const CustomResponse = {
  success: (res, message = "Success", data = []) =>
    res.status(200).send({ success: true, message, data }),
  error: (res, message = "Error", data = []) =>
    res.status(400).send({ success: false, message, data }),
  fail: (res, message = "Fail", data = []) =>
    res.status(400).send({ success: false, message, data }),
  unauthorized: (res, message = "Unauthorized") =>
    res.status(401).send({ success: false, message })
};
module.exports = CustomResponse;
