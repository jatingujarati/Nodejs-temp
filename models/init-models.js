const DataTypes = require("sequelize").DataTypes;

const _ADDRESSES = require("./addresses");
const _USERS = require("./users");

function initModels(sequelize) {
  const USERS = _USERS(sequelize, DataTypes);
  const ADDRESSES = _ADDRESSES(sequelize, DataTypes);

  ADDRESSES.hasMany(USERS, { foreignKey: "address_id" });
  USERS.belongsTo(ADDRESSES, { foreignKey: "address_id", as: "address" });

  return {
    ADDRESSES,
    USERS,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
