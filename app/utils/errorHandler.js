// we will create an error handler class
// class lazem esm yebde majuscule (convinction)
class ErrorHandler extends Error {
    constructor(
      message,
      statusCode //statusCode kima 500 w 404
    ) {
      super(message); // bech tprésenti l error
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  module.exports = ErrorHandler;