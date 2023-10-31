const sequelize = require("../../configs/connectDatabase");
const { DataTypes } = require("sequelize");
const { UsersInfo } = require("../authentication/config");

const Products = sequelize.define(
  "Products",
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    file_products_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sale: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

const FileProducts = sequelize.define(
  "FileProducts",
  {
    file_products_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    image1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "file_products",
    timestamps: false,
  }
);

const Ratings = sequelize.define(
  "Ratings",
  {
    rating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "ratings",
    timestamps: false,
  }
);

const Carts = sequelize.define(
  "Carts",
  {
    cart_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "carts",
    timestamps: false,
  }
);

const CustomerOrders = sequelize.define(
  "CustomerOrders",
  {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "customer_orders",
    timestamps: false,
  }
);

// Lấy mảng thì dùng hasMany lấy object thì dùng belongsTo (nếu mà khác field thì dùng này foreignKey - sourceKey)
Carts.belongsTo(Products, { foreignKey: "product_id", as: "product" });

Carts.belongsTo(UsersInfo, { foreignKey: "user_id", as: "user" });

Products.hasMany(Ratings, { foreignKey: "product_id", as: "evaluate" });

Products.hasMany(CustomerOrders, { foreignKey: "product_id", as: "sold" });

Products.belongsTo(FileProducts, {
  foreignKey: "file_products_id",
  as: "files",
});

Ratings.belongsTo(UsersInfo, { foreignKey: "user_id", as: "user" });

CustomerOrders.belongsTo(Products, { foreignKey: "product_id", as: "orders" });

module.exports = {
  Products,
  FileProducts,
  Ratings,
  Carts,
  UsersInfo,
  CustomerOrders,
};
