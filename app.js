const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Khởi tạo ứng dụng
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "500MB" })); // Tăng giới hạn kích thước lên 10MB (tuỳ chỉnh kích thước)

app.use(cors());

// Định tuyến các API endpoint
require("./src/app/authentication/router")(app);
require("./src/app/products/router")(app);

// Khởi động server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port localhost:${port}.`);
});
