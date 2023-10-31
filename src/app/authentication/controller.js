const model = require("./model");
const { onResponse } = require("../../utils/index");

module.exports = {
  registerCT: async (req, res) => {
    await onResponse(req, res, model.registerMD, {
      checkData: [
        "full_name",
        "phone_number",
        "day_of_birth",
        "gender",
        "user_name",
        "password",
        "type_account",
      ],
      data: ({
        full_name,
        phone_number,
        day_of_birth,
        gender,
        user_name,
        password,
        type_account,
      } = req.body),
    });
  },

  loginCT: async (req, res) => {
    await onResponse(req, res, model.loginMD, {
      checkData: ["user_name", "password", "type_account"],
      data: ({ user_name, password, type_account } = req.body),
      message: "Đăng nhập thành công!",
    });
  },

  userInfoCT: async (req, res) => {
    await onResponse(req, res, model.userInfoMD, {
      data: { account_id: req.data.account_id, user_name: req.data.user_name },
    });
  },

  updateUserInfoCT: async (req, res) => {
    const { user_id, image, full_name, phone_number, day_of_birth, gender } =
      req.body;
    await onResponse(req, res, model.updateUserInfoMD, {
      checkData: [
        "user_id",
        "full_name",
        "phone_number",
        "day_of_birth",
        "gender",
      ],
      data: {
        user_id,
        image,
        full_name,
        phone_number,
        day_of_birth,
        gender,
        host: req.headers.host,
      },
      message: "Cập nhật dữ liệu thành công!",
    });
  },

  // ------------------- API TRANG ADMIN -----------------------------------
  accountCT: async (req, res) => {
    const { status, key_search } = req.query;
    await onResponse(req, res, model.accountMD, {
      data: { status, key_search },
    });
  },

  updateStatusAccountCT: async (req, res) => {
    const { account_id, status } = req.query;
    await onResponse(req, res, model.updateStatusAccountMD, {
      data: { account_id, status },
      message: "Cập nhật dữ liệu thành công!",
    });
  },

  rechargeCT: async (req, res) => {
    const { account_id, deposit_amount } = req.body;
    await onResponse(req, res, model.rechargeMD, {
      data: { account_id, deposit_amount },
      message: "Nạp tiền thành công!",
    });
  },

  getNotificationCT: async (req, res) => {
    const { account_id, new_notification } = req.query;
    await onResponse(req, res, model.getNotificationMD, {
      data: { account_id, new_notification },
    });
  },

  updateNotificationCT: async (req, res) => {
    const { account_id } = req.query;
    await onResponse(req, res, model.updateNotificationMD, {
      data: { account_id },
    });
  },
};
