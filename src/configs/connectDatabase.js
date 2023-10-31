const Sequelize = require("sequelize");
const sequelize = new Sequelize("dev-project-app", "root", "tien2000", {
  host: "localhost",
  dialect: "mysql",
});

// Trường hợp kết nối với máy chủ https://www.db4free.net/ ---------------------

// const Sequelize = require("sequelize");
// const sequelize = new Sequelize("t2kproject", "tien2000", "tien2000", {
//   host: "db4free.net",
//   dialect: "mysql",
// });

// ------------------------------------------------------------------------------

sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối database thành công!");
  })
  .catch((error) => {
    console.error("Kết nối database lỗi:", error);
  });

module.exports = sequelize;
