const mongoose = require("../server/functions/node_modules/mongoose");

module.exports = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(true);
  }
};
