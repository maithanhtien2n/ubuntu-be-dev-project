const { Account, UsersInfo, Notification } = require("./config");
const { throwError, formatToVND } = require("../../utils/index");
const {
  onUrlFile,
  onImagePath,
  onSaveFile,
  onDeleteFile,
} = require("../../utils/upload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
require("dotenv").config();

module.exports = {
  registerMD: async ({
    full_name,
    phone_number,
    day_of_birth,
    gender,
    user_name,
    password,
    type_account,
  }) => {
    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const accountInfo = await Account.findOne({ where: { user_name } });

      if (accountInfo) {
        throwError(210, "Tên người dùng đã tồn tại!");
      }

      const account = await Account.create({
        user_name,
        password: hashedPassword,
        role: "USER",
        type_account,
        status: 1,
      });

      await UsersInfo.create({
        account_id: account.account_id,
        vip: 0,
        full_name,
        phone_number: Number(phone_number),
        day_of_birth,
        gender,
        account_money: 0,
      });

      return "Đăng ký tài khoản thành công!";
    } catch (error) {
      throw error;
    }
  },

  loginMD: async ({ user_name, password, type_account }) => {
    try {
      const account = await Account.findOne({
        where: { user_name, type_account },
      });

      if (!account || !bcrypt.compareSync(password, account.password)) {
        throwError(205, "Tên tài khoản hoặc mật khẩu không chính xác!");
      }

      if (+account.status === 0) {
        throwError(206, "Tài khoản của bạn đã bị khóa!");
      }

      return {
        account_id: account.account_id,
        token: jwt.sign(
          {
            account_id: account.account_id,
            user_name: account.user_name,
            status: account.status,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        ),
      };
    } catch (error) {
      throw error;
    }
  },

  userInfoMD: async ({ account_id, user_name }) => {
    try {
      const userInfo = await UsersInfo.findOne({ where: { account_id } });
      const account = await Account.findOne({ where: { account_id } });

      if (account.type_account === "USER_ACCOUNT") {
        return {
          account_id,
          user_name,
          type_account: account.type_account,
          status: +account?.status ? "Hoạt động" : "Đã khóa",
          status_code: +account?.status ? "ACTIVE" : "LOCK",
          user_info: userInfo,
        };
      }

      if (account.type_account === "ADMIN_ACCOUNT") {
        const onRenderRoleName = (role) => {
          switch (role) {
            case "USER":
              return "Người dùng";
            case "CENSOR":
              return "Kiểm duyệt viên";
            case "ADMINISTRATORS":
              return "Quản trị viên";
          }
        };

        return {
          account_id,
          user_name,
          role: account?.role,
          role_name: onRenderRoleName(account?.role),
          type_account: account?.type_account,
          status: +account?.status ? "Hoạt động" : "Đã khóa",
          status_code: +account?.status ? "ACTIVE" : "LOCK",
          user_info: [{ ...userInfo }].map(({ dataValues: item }) => ({
            user_id: item?.user_id,
            image: item?.image,
            full_name: item?.full_name,
            phone_number: item?.phone_number,
            day_of_birth: item?.day_of_birth,
            gender: item?.gender,
            created_at: item?.created_at,
            updated_at: item?.updated_at,
          }))[0],
        };
      }
    } catch (error) {
      throw error;
    }
  },

  updateUserInfoMD: async ({
    user_id,
    image,
    full_name,
    phone_number,
    day_of_birth,
    gender,
    host,
  }) => {
    try {
      const imagePath = image
        ? onImagePath(image.name, "accounts/")
        : undefined;

      const userInfo = await UsersInfo.findOne({ where: { user_id } });

      if (!userInfo) {
        throwError(201, `Không tồn tại người dùng có id là: ${user_id}`);
      }

      if (userInfo.image && image) {
        onDeleteFile(userInfo.image, "accounts/");
      }

      await UsersInfo.update(
        {
          image: image ? onUrlFile(host, imagePath) : undefined,
          full_name,
          phone_number,
          day_of_birth,
          gender,
        },
        { where: { user_id } }
      );

      if (image) {
        onSaveFile(imagePath, image.base64);
      }

      return "Cập nhật thông tin thành công!";
    } catch (error) {
      throw error;
    }
  },

  // ----------------- API TRANG ADMIN ----------------------
  accountMD: async ({ status, key_search }) => {
    try {
      const onStatus = () => {
        switch (status) {
          case "ACTIVE":
            return 1;
          case "LOCK":
            return 0;
          default:
            return "";
        }
      };

      const whereCondition = {
        type_account: "USER_ACCOUNT",
      };

      if (status) {
        whereCondition.status = onStatus();
      }

      if (key_search) {
        whereCondition.user_name = key_search;
      }

      const accounts = await Account.findAll({
        where: whereCondition,
        include: [
          {
            model: UsersInfo,
            as: "user_detail",
          },
        ],
      });

      return accounts.map((item) => ({
        account_id: item?.account_id,
        user_id: item?.user_detail[0]?.user_id,
        user_code: `USC${item?.account_id}`,
        full_name: item?.user_detail[0]?.full_name,
        user_name: item?.user_name,
        phone_number: item?.user_detail[0]?.phone_number,
        day_of_birth: item?.user_detail[0]?.day_of_birth,
        gender: item?.user_detail[0]?.gender,
        account_money: item?.user_detail[0]?.account_money,
        status_code: +item?.status === 1 ? "ACTIVE" : "LOCK",
        status: +item?.status === 1 ? "Hoạt động" : "Khóa",
        created_at: item?.user_detail[0]?.created_at,
        updated_at: item?.user_detail[0]?.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  updateStatusAccountMD: async ({ account_id, status }) => {
    try {
      const onStatus = () => {
        switch (status) {
          case "ACTIVE":
            return 1;
          case "LOCK":
            return 0;
          default:
            return "";
        }
      };

      for (const id of account_id) {
        await Account.update(
          { status: onStatus() },
          { where: { account_id: id } }
        );
      }

      return "Lưu dữ liệu thành công!";
    } catch (error) {
      throw error;
    }
  },

  rechargeMD: async ({ account_id, deposit_amount }) => {
    try {
      const userInfo = await UsersInfo.findOne({ where: { account_id } });

      if (!userInfo) {
        throwError(201, `hông tồn tại người dùng có id: ${account_id}`);
      }

      if (+deposit_amount > 1000000) {
        throwError(202, "Chỉ cho phép nạp mỗi lần 1 triệu trở xuống");
      }

      const newAccountMoney = +userInfo.account_money + +deposit_amount;

      await UsersInfo.update(
        { account_money: newAccountMoney },
        { where: { account_id } }
      );

      await Notification.create({
        account_id,
        content: `Chúng tôi vừa nạp thành công ${formatToVND(
          deposit_amount
        )} vào tài khoản của bạn!`,
        new_notification: 1,
      });

      return "Lưu dữ liệu thành công!";
    } catch (error) {
      throw error;
    }
  },

  getNotificationMD: async ({ account_id, new_notification }) => {
    try {
      const onNewNotification = () => {
        if (new_notification === "NEW") {
          return 1;
        }

        if (new_notification === "OLD") {
          return 0;
        }
      };

      const whereCondition = {
        account_id,
      };

      if (new_notification) {
        whereCondition.new_notification = onNewNotification();
      }

      const notifications = await Notification.findAll({
        where: whereCondition,
      });

      return notifications.reverse();
    } catch (error) {
      throw error;
    }
  },

  updateNotificationMD: async ({ account_id }) => {
    try {
      await Notification.update(
        { new_notification: 0 },
        { where: { account_id } }
      );
      return "Cập nhật dữ liệu thành công!";
    } catch (error) {
      throw error;
    }
  },
};
