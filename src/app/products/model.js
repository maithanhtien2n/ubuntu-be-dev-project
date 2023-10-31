require("dotenv").config();
const {
  Products,
  FileProducts,
  Ratings,
  Carts,
  UsersInfo,
  CustomerOrders,
} = require("./config");
const {
  onUrlFile,
  onImagePath,
  onSaveFile,
  onDeleteFile,
} = require("../../utils/upload");
const { Op } = require("sequelize");
const { throwError, generateRandomCode } = require("../../utils/index");

const onRenderStatus = (value, type = false) => {
  if (type) {
    switch (value) {
      case "1":
        return "Dự thảo";
      case "2":
        return "Hoạt động";
      case "3":
        return "Tạm ngưng";
    }
  } else {
    switch (value) {
      case "1":
        return "DRAFT";
      case "2":
        return "ACTIVE";
      case "3":
        return "PAUSE";
    }
  }
};

const onReturnImage = (url) => {
  if (url) {
    return {
      name: url.split("$")[1],
      base64: url,
    };
  } else {
    return null;
  }
};

module.exports = {
  productsMD: async ({ key_search }) => {
    try {
      const key = key_search ? key_search : "";
      return [
        ...(await Products.findAll({
          where: {
            status: 2,
            [Op.or]: [
              {
                name: {
                  [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
                },
              },
              {
                description: {
                  [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
                },
              },
            ],
          },
          include: [
            {
              model: CustomerOrders,
              as: "sold",
            },
          ],
        })),
      ].map((item) => {
        return {
          product_id: item?.product_id,
          image: item?.image,
          name: item?.name,
          price: item?.price,
          sale: item?.sale ? `${item?.sale}%` : undefined,
          price_sale: item?.sale
            ? item?.price - (item?.price * item?.sale) / 100
            : undefined,
          description: item?.description,
          sold: item?.sold.length,
          created_at: item?.created_at,
          updated_at: item?.updated_at,
        };
      });
    } catch (error) {
      throw error;
    }
  },

  productDetailMD: async ({ id }) => {
    try {
      const item = await Products.findOne({
        where: { product_id: id },
        include: [
          {
            model: FileProducts,
            as: "files",
          },
          {
            model: CustomerOrders,
            as: "sold",
          },
          {
            model: Ratings,
            as: "evaluate",
            attributes: [
              "rating_id",
              "start_amount",
              "content",
              "created_at",
              "updated_at",
            ],
            include: [
              {
                model: UsersInfo,
                as: "user",
                attributes: ["user_id", "image", "full_name"],
              },
            ],
          },
        ],
      });
      return {
        product_id: item?.product_id,
        image: item?.image,
        files: {
          file_products_id: item?.files?.file_products_id,
          images: [
            item?.files?.image1,
            item?.files?.image2,
            item?.files?.image3,
          ],
          video: onReturnImage(item?.files?.video),
          file: onReturnImage(item?.files?.file),
        },
        name: item?.name,
        price: item?.price,
        sale: item?.sale ? `Sale ${item?.sale}%` : undefined,
        price_sale: item?.sale
          ? item?.price - (item?.price * item?.sale) / 100
          : undefined,
        description: item?.description,
        sold: item?.sold.length,
        amount_evaluate: item?.evaluate.length,
        total_evaluate: !isNaN(
          (
            +item?.evaluate
              .filter(
                ({ start_amount }) => start_amount !== 0 && start_amount !== -1
              )
              .reduce((start, { start_amount }) => start + start_amount, 0) /
            item?.evaluate.filter(
              ({ start_amount }) => start_amount !== 0 && start_amount !== -1
            ).length
          ).toFixed(1)
        )
          ? (
              +item?.evaluate
                .filter(
                  ({ start_amount }) =>
                    start_amount !== 0 && start_amount !== -1
                )
                .reduce((start, { start_amount }) => start + start_amount, 0) /
              item?.evaluate.filter(
                ({ start_amount }) => start_amount !== 0 && start_amount !== -1
              ).length
            ).toFixed(1)
          : null,
        evaluate: item?.evaluate
          .map((item) => {
            return {
              user_id: item?.user?.user_id,
              rating_id: item?.rating_id,
              image: item?.user?.image,
              full_name: item?.user?.full_name,
              start_key: item?.start_amount,
              start_amount:
                item?.start_amount === 0 || item?.start_amount === -1
                  ? item?.start_amount === 0
                    ? "Chưa trải nghiệm sản phẩm"
                    : "Từng trải nghiệm sản phẩm"
                  : item?.start_amount,
              content: item?.content,
              created_at: item?.created_at,
              updated_at: item?.updated_at,
            };
          })
          .reverse()
          .sort((a, b) => {
            if (a.start_key === 0 || a.start_key === -1) {
              return 1;
            }
            if (b.start_key === 0 || b.start_key === -1) {
              return -1;
            }

            return 0;
          }),
        created_at: item?.created_at,
        updated_at: item?.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  createEvaluateMD: async ({ user_id, product_id, start_amount, content }) => {
    try {
      if (!(await UsersInfo.findOne({ where: { user_id } }))) {
        throwError(211, "Mã người dùng không tồn tại!");
      }

      if (!(await Products.findOne({ where: { product_id } }))) {
        throwError(212, "Mã sản phẩm không tồn tại!");
      }

      await Ratings.create({
        user_id,
        product_id,
        start_amount: start_amount ? start_amount : 0,
        content,
      });
      return "Đã thêm đánh giá sản phẩm thành công!";
    } catch (error) {
      throw error;
    }
  },

  // API giỏ hàng
  cartsMD: async ({ user_id }) => {
    try {
      const carts = await Carts.findAll({
        where: { user_id },
        attributes: ["cart_id", "created_at", "updated_at"],
        include: [
          {
            model: Products,
            as: "product",
          },
          {
            model: UsersInfo,
            as: "user",
          },
        ],
      });

      return [...carts].map((item) => {
        // Tính kết quả nếu có sale còn không có sale thì undefined
        const price_sale = item?.product?.sale
          ? item?.product?.price -
            (item?.product?.price * item?.product?.sale) / 100
          : undefined;

        const vip = (value) => {
          switch (value) {
            case 1:
              return 5;
            case 2:
              return 10;
            case 3:
              return 15;
            case 4:
              return 20;
            default:
              return 0;
          }
        };

        return {
          cart_id: item?.cart_id,
          product_id: item?.product?.product_id,
          image: item?.product?.image,
          name: item?.product?.name,
          rating: 4,
          price: item?.product?.price,
          price_sale: item?.product?.sale
            ? item?.product?.price -
              (item?.product?.price * item?.product?.sale) / 100
            : undefined,
          vip: item?.user?.vip ? `Giảm ${vip(item?.user?.vip)}%` : "Không vip",
          money_number: !item?.user?.vip
            ? price_sale
              ? price_sale
              : item?.product?.price
            : price_sale
            ? price_sale - (price_sale * vip(item?.user?.vip)) / 100
            : item?.product?.price -
              (item?.product?.price * vip(item?.user?.vip)) / 100,
          created_at: item?.created_at,
          updated_at: item?.updated_at,
        };
      });
    } catch (error) {
      throw error;
    }
  },

  createCartsMD: async ({ user_id, product_id, vip }) => {
    try {
      let vip_result;

      switch (vip) {
        case "1":
          vip_result = 5;
          break;
        case "2":
          vip_result = 10;
          break;
        case "3":
          vip_result = 15;
          break;
        case "4":
          vip_result = 20;
          break;
        default:
          vip_result = 0;
          break;
      }

      if (!(await UsersInfo.findOne({ where: { user_id } }))) {
        throwError(211, "Mã người dùng Không tồn tại!");
      }

      if (!(await Products.findOne({ where: { product_id } }))) {
        throwError(212, "Mã sản phẩm Không tồn tại!");
      }

      if (await Carts.findOne({ where: { product_id, user_id } })) {
        throwError(213, "Sản phẩm này đã có trong giỏ hàng!");
      }

      return await Carts.create({ user_id, product_id, vip: vip_result });
    } catch (error) {
      throw error;
    }
  },

  removeCartsMD: async ({ ids }) => {
    try {
      if (!ids[0]) {
        throwError(240, "Lỗi code không kiểm tra null!");
      }

      for (const id of ids) {
        await Carts.destroy({ where: { cart_id: id } });
      }

      return ids;
    } catch (error) {
      throw error;
    }
  },

  // API đơn hàng khách hàng
  ordersMD: async ({ user_id, key_search }) => {
    try {
      const key = key_search ? key_search : "";
      return [
        ...(await CustomerOrders.findAll({
          where: { user_id },
          include: [
            {
              model: Products,
              as: "orders",
              include: [
                {
                  model: FileProducts,
                  as: "files",
                },
              ],
              where: {
                [Op.or]: [
                  {
                    name: {
                      [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
                    },
                  },
                  {
                    description: {
                      [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
                    },
                  },
                ],
              },
            },
          ],
        })),
      ]
        .map((item) => ({
          id_order: item?.id_order,
          product_id: item?.orders?.product_id,
          order_code: item?.order_code,
          image: item?.orders?.image,
          name: item?.orders?.name,
          price: item?.purchase_price,
          fileDownload: item?.orders?.files?.file,
          created_at: item?.created_at,
          updated_at: item?.updated_at,
        }))
        .reverse();
    } catch (error) {
      throw error;
    }
  },

  createOrdersCT: async ({ user_id, products, total_money }) => {
    try {
      if (!products.length) {
        throwError(204, "Lỗi code không kiểm tra null!");
      }

      const user = await UsersInfo.findOne({ where: { user_id } });

      if (!user) {
        throwError(211, "Mã người dùng không tồn tại!");
      }

      if (Number(user.account_money) < Number(total_money)) {
        throwError(
          211,
          "Số tiền trong tài khoản của bạn không đủ, vui lòng nạp thêm!"
        );
      }

      await UsersInfo.update(
        {
          account_money: Number(user.account_money) - Number(total_money),
        },
        { where: { user_id } }
      );

      for (const item of products) {
        await CustomerOrders.create({
          order_code: generateRandomCode(
            `1234567890`,
            "QWERTYUIOPASDFGHJKLZXCVBNM",
            8
          ),
          user_id,
          product_id: item.product_id,
          purchase_price: item.price,
        });

        await Carts.destroy({ where: { product_id: item.product_id } });
      }

      return "Đã thêm đơn hàng thành công!";
    } catch (error) {
      throw error;
    }
  },

  // ------------------ API TRANG ADMIN ------------------------------

  productsAdminMD: async ({ status, key_search }) => {
    try {
      const onStatus = () => {
        switch (status) {
          case "DRAFT":
            return 1;
          case "ACTIVE":
            return 2;
          case "PAUSE":
            return 3;
          default:
            return "";
        }
      };

      const key = key_search ? key_search : "";
      const whereCondition = {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
            },
          },
          {
            description: {
              [Op.like]: `%${key}%`, // Sử dụng Op.like để thực hiện tìm kiếm gần đúng
            },
          },
        ],
      };

      if (status) {
        whereCondition.status = onStatus();
      }

      const products = await Products.findAll({
        where: whereCondition,
        include: [
          {
            model: FileProducts,
            as: "files",
          },
        ],
      });

      return products.map((item) => ({
        product_id: item?.product_id,
        product_code: `PDC${item?.product_id}`,
        image: item?.image,
        files: {
          file_products_id: item?.files?.file_products_id,
          image1: item?.files?.image1,
          image2: item?.files?.image2,
          image3: item?.files?.image3,
          video: item?.files?.video,
          file: item?.files?.file,
        },
        name: item?.name,
        sale: `${item?.sale}%`,
        price: item?.price,
        description: item?.description,
        status_code: onRenderStatus(item?.status),
        status: onRenderStatus(item?.status, true),
        created_at: item?.created_at,
        updated_at: item?.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  productDetailAdminMD: async ({ product_id }) => {
    try {
      const item = await Products.findOne({
        where: { product_id },
        include: [
          {
            model: FileProducts,
            as: "files",
          },
        ],
      });

      return {
        product_id: item?.product_id,
        product_code: `PDC${item?.product_id}`,
        image: onReturnImage(item?.image),
        files: {
          file_products_id: item?.files?.file_products_id,
          image1: onReturnImage(item?.files?.image1),
          image2: onReturnImage(item?.files?.image2),
          image3: onReturnImage(item?.files?.image3),
          video: onReturnImage(item?.files?.video),
          file: onReturnImage(item?.files?.file),
        },
        name: item?.name,
        sale: `${item?.sale}%`,
        price: item?.price,
        description: item?.description,
        status_code: onRenderStatus(item?.status),
        status: onRenderStatus(item?.status, true),
        created_at: item?.created_at,
        updated_at: item?.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  infoProductsAdminMD: async ({
    product_id,
    image,
    name,
    price,
    description,
    host,
  }) => {
    try {
      const imagePath = image
        ? onImagePath(image.name, "products/")
        : undefined;

      if (product_id) {
        const products = await Products.findOne({ where: { product_id } });

        if (!products) {
          throwError(201, `Không tồn tại sản phẩm có id là: ${product_id}`);
        }

        if (products.image && image) {
          onDeleteFile(products.image, "products/");
        }

        const bodyUpdate = {
          name,
          price,
          description,
        };

        if (image) {
          bodyUpdate.image = onUrlFile(host, imagePath);
        }

        await Products.update(bodyUpdate, { where: { product_id } });

        if (image) {
          onSaveFile(imagePath, image.base64);
        }
        return product_id;
      } else {
        const newProduct = await Products.create({
          image: image ? onUrlFile(host, imagePath) : undefined,
          name,
          price,
          description,
          sale: 0,
          status: 1,
        });

        if (image) {
          onSaveFile(imagePath, image.base64);
        }
        return newProduct.product_id;
      }
    } catch (error) {
      throw error;
    }
  },

  descriptionProductsAdminMD: async ({
    product_id,
    file_products_id,
    deleteFiles,
    image1,
    image2,
    image3,
    video,
    file,
    host,
  }) => {
    try {
      const image1Path = image1
        ? onImagePath(image1.name, "products/")
        : undefined;
      const image2Path = image2
        ? onImagePath(image2.name, "products/")
        : undefined;
      const image3Path = image3
        ? onImagePath(image3.name, "products/")
        : undefined;
      const videoPath = video
        ? onImagePath(video.name, "products/")
        : undefined;
      const filePath = file ? onImagePath(file.name, "products/") : undefined;

      if (file_products_id) {
        const fileProducts = await FileProducts.findOne({
          where: { file_products_id },
        });

        if (!fileProducts) {
          throwError(
            201,
            `Không tồn tại danh sách tệp có id là: ${file_products_id}`
          );
        }

        const bodyUpdate = {};

        if (deleteFiles?.length) {
          for (const item of deleteFiles) {
            bodyUpdate[item.key] = null;
            onDeleteFile(item.url, "products/");
          }
        }

        // if (fileProducts.image1 && image1) onDeleteFile(fileProducts.image1);
        // if (fileProducts.image2 && image2) onDeleteFile(fileProducts.image2);
        // if (fileProducts.image3 && image3) onDeleteFile(fileProducts.image3);
        // if (fileProducts.video && video) onDeleteFile(fileProducts.video);
        // if (fileProducts.file && file) onDeleteFile(fileProducts.file);

        if (image1) bodyUpdate.image1 = onUrlFile(host, image1Path);
        if (image2) bodyUpdate.image2 = onUrlFile(host, image2Path);
        if (image3) bodyUpdate.image3 = onUrlFile(host, image3Path);
        if (video) bodyUpdate.video = onUrlFile(host, videoPath);
        if (file) bodyUpdate.file = onUrlFile(host, filePath);

        await FileProducts.update(bodyUpdate, { where: { file_products_id } });

        if (image1) onSaveFile(image1Path, image1.base64);
        if (image2) onSaveFile(image2Path, image2.base64);
        if (image3) onSaveFile(image3Path, image3.base64);
        if (video) onSaveFile(videoPath, video.base64);
        if (file) onSaveFile(filePath, file.base64);

        return file_products_id;
      } else {
        const fileProduct = await FileProducts.create({
          image1: image1 ? onUrlFile(host, image1Path) : undefined,
          image2: image2 ? onUrlFile(host, image2Path) : undefined,
          image3: image3 ? onUrlFile(host, image3Path) : undefined,
          video: video ? onUrlFile(host, videoPath) : undefined,
          file: file ? onUrlFile(host, filePath) : undefined,
        });

        await Products.update(
          {
            file_products_id: fileProduct.file_products_id,
          },
          { where: { product_id } }
        );

        if (image1) onSaveFile(image1Path, image1.base64);
        if (image2) onSaveFile(image2Path, image2.base64);
        if (image3) onSaveFile(image3Path, image3.base64);
        if (video) onSaveFile(videoPath, video.base64);
        if (file) onSaveFile(filePath, file.base64);

        return file_products_id;
      }
    } catch (error) {
      throw error;
    }
  },

  statusProductsAdminMD: async ({ ids, status }) => {
    try {
      const onReturnStatus = () => {
        switch (status) {
          case "DRAFT":
            return 1;
          case "ACTIVE":
            return 2;
          case "PAUSE":
            return 3;
        }
      };

      for (const id of ids) {
        const product = await Products.findOne({ where: { product_id: id } });

        if (!product) {
          throwError(201, `Không tồn tại sản phẩm có id là: ${id}`);
        }

        if (!product.file_products_id) {
          throwError(
            202,
            `Vui lòng khai báo mô tả sản phẩm có id ${id} trước khi kích hoạt!`
          );
        }

        await Products.update(
          { status: +onReturnStatus() },
          { where: { product_id: id } }
        );
      }

      return "Cập nhật dữ liệu thành công!";
    } catch (error) {
      throw error;
    }
  },
};
