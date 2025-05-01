export const sendResponse = (res, statusCode = 200, message, props = null) => {
  res.status(statusCode).send({
    success: statusCode < 400,
    message,
    ...props,
  });
};
