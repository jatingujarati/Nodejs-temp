const Sequelize = require('sequelize').Sequelize;
const initModels = require('../models/v1/init-models');
const { database, dialect, isDbLogging } = require('../config');
const { pagination, updateFingerprint, getRecordById } = require('../utils/dbHelper');

const sequelize = new Sequelize(database.name, database.user, database.password, {
  logging: false,
  host: database.host,
  dialect: dialect,
});

// sequelize.sync({ truncate: false, alter: true, force: false, logging: false });
if (process.env.NODE_ENV === 'testing') sequelize.sync({ truncate: true, force: true, logging: false });

/**
 * Add after create hook globally
 */
sequelize.addHook('afterCreate', async (model, options) => {
  await updateFingerprint(model);
  addVersion(model, 'create', options);
})

/**
 * Add after update hook globally
 */
sequelize.addHook('afterUpdate', async (model, options) => {
  await updateFingerprint(model);
  addVersion(model, 'update', options);
})

/**
 * Check database connection
 */
sequelize.authenticate()
  .then(() => console.log('\x1b[32m%s\x1b[0m', 'Database Connected Successfully...'))
  .catch((err) => {
    console.log('\x1b[31m%s\x1b[0m', 'Error while connecting database...');
    console.log(err); process.exit(0)
  });

/**
 * Initialize all models and pass sequelize connection object
 */
const db = initModels(sequelize);

/**
 * Add operation entry in versions table
 * @param {*} Object
 */
const addVersion = async (model, event, options) => {
  if (isDbLogging === "true") {
    const data = { item_type: model.constructor.name, item_id: model.id, event: event, whodunnit: options.id, ip: options.ip_address, object: JSON.stringify(model.dataValues), request_id: options['correlation-id'] };
    if (event === "update") {
      data['object_changes'] = JSON.stringify(model.dataValues);
      data['object'] = JSON.stringify(options.previousObject);
    }
    await db.VERSIONS.create(data, { hooks: false });
  }
}

/**
 * Append common methods to all models
 */
Object.keys(db).map(key => {
  db[key].pagination = pagination;
  db[key].getRecordById = getRecordById
});

/**
 * Set sequelize connection object globally
 */
global.sequelize = sequelize;

module.exports = db;
