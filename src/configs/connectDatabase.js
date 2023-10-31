const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "db_dev_project",
  "tienthanh2000",
  "Tienthanh2000@",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

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
