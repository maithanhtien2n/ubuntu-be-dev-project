const model = require("./model");
const { onResponse } = require("../../utils/index");

module.exports = {
  // API sản phẩm

  productsCT: async (req, res) => {
    await onResponse(req, res, model.productsMD, {
      data: ({ key_search } = req.body),
    });
  },

  productDetailCT: async (req, res) => {
    await onResponse(req, res, model.productDetailMD, {
      data: ({ id } = req.params),
    });
  },

  createEvaluateCT: async (req, res) => {
    await onResponse(req, res, model.createEvaluateMD, {
      checkData: ["user_id", "product_id", "content"],
      data: ({ user_id, product_id, start_amount, content } = req.body),
      message: "Đã thêm đánh giá",
    });
  },

  // ---------------------------------------------------------------

  // API giỏ hàng
  cartsCT: async (req, res) => {
    await onResponse(req, res, model.cartsMD, {
      data: ({ user_id } = req.query),
    });
  },

  createCartsCT: async (req, res) => {
    await onResponse(req, res, model.createCartsMD, {
      checkData: ["user_id", "product_id", "vip"],
      data: ({ user_id, product_id, vip } = req.body),
      message: "Đã thêm vào giỏ hàng",
    });
  },

  removeCartsCT: async (req, res) => {
    const ids = req.query.ids.split(",").map((id) => parseInt(id));
    await onResponse(req, res, model.removeCartsMD, {
      data: { ids },
      message: "Đã xóa khỏi giỏ hàng",
    });
  },

  // ----------------------------------------------------------------

  // API đơn hàng khách hàng
  ordersCT: async (req, res) => {
    await onResponse(req, res, model.ordersMD, {
      data: ({ user_id, key_search } = req.query),
    });
  },

  createOrdersCT: async (req, res) => {
    await onResponse(req, res, model.createOrdersCT, {
      checkData: ["user_id"],
      data: ({ user_id, products, total_money } = req.body),
      message: "Thanh toán thành công",
    });
  },

  // ------------------ API TRANG ADMIN ------------------------------

  productsAdminCT: async (req, res) => {
    const { status, key_search } = req.query;
    await onResponse(req, res, model.productsAdminMD, {
      data: { status, key_search },
    });
  },

  productDetailAdminCT: async (req, res) => {
    const id = req.params.id;
    await onResponse(req, res, model.productDetailAdminMD, {
      data: { product_id: id },
    });
  },

  infoProductsAdminCT: async (req, res) => {
    const { product_id, image, name, price, description } = req.body;
    await onResponse(req, res, model.infoProductsAdminMD, {
      checkData: ["name", "price", "description"],
      data: {
        product_id,
        image,
        name,
        price,
        description,
        host: req.headers.host,
      },
      message: "Lưu dữ liệu thành công!",
    });
  },

  descriptionProductsAdminCT: async (req, res) => {
    const {
      product_id,
      file_products_id,
      deleteFiles,
      image1,
      image2,
      image3,
      video,
      file,
    } = req.body;
    await onResponse(req, res, model.descriptionProductsAdminMD, {
      // checkData: ["file"],
      data: {
        product_id,
        file_products_id,
        deleteFiles,
        image1,
        image2,
        image3,
        video,
        file,
        host: req.headers.host,
      },
      message: "Lưu dữ liệu thành công!",
    });
  },

  statusProductsAdminCT: async (req, res) => {
    const { ids, status } = req.query;
    await onResponse(req, res, model.statusProductsAdminMD, {
      data: { ids, status },
      message: "Lưu dữ liệu thành công!",
    });
  },
};
