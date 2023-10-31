module.exports = (router) => {
  const commonRoute = "/api/v1";
  const controller = require("./controller");
  const { authenticateToken } = require("../middlewares/index");

  // API mở file ảnh hoặc video
  const onApiOpenFile = (folderName = "") => {
    router.get(`/uploads${folderName}:name`, (req, res) => {
      const fileName = req.params.name;
      const options = {
        root: `uploads${folderName}`,
        headers: {
          "Content-Type": fileName.endsWith(".mp4") ? "video/mp4" : "image",
        },
      };
      res.sendFile(fileName, options, (err) => {
        if (err) {
          console.error(err);
          res.status(500).end();
        }
      });
    });
  };
  onApiOpenFile("/");
  onApiOpenFile("/accounts/");
  onApiOpenFile("/products/");

  // API đăng ký tài khoản
  router.post(`${commonRoute}/account/register`, controller.registerCT);

  // API đăng nhập tài khoản
  router.post(`${commonRoute}/account/login`, controller.loginCT);

  // API lấy thông tin người dùng
  router.get(
    `${commonRoute}/user-info`,
    authenticateToken,
    controller.userInfoCT
  );

  // API cập nhật thông tin người dùng
  router.put(
    `${commonRoute}/user-info`,
    authenticateToken,
    controller.updateUserInfoCT
  );

  // ------------------ API TRANG ADMIN ------------------------------

  router.post(
    `${commonRoute}/accounts`,
    authenticateToken,
    controller.accountCT
  );

  router.put(
    `${commonRoute}/accounts`,
    authenticateToken,
    controller.updateStatusAccountCT
  );

  router.post(
    `${commonRoute}/accounts/recharge`,
    authenticateToken,
    controller.rechargeCT
  );

  router.get(
    `${commonRoute}/accounts/notification`,
    authenticateToken,
    controller.getNotificationCT
  );

  router.put(
    `${commonRoute}/accounts/notification`,
    authenticateToken,
    controller.updateNotificationCT
  );
};
