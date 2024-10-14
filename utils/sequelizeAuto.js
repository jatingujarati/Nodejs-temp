const SequelizeAuto = require('sequelize-auto');
const Sequelize = require('sequelize');
require('dotenv').config({ path: '../.env' })

const db = {
  name: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  pwd: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  dialect: process.env.DIALECT
}

const sequelize = new Sequelize(db.name, db.user, db.pwd, { host: db.host, dialect: db.dialect });

const options = {
  directory: './models/v1',
  caseModel: 'u',
  additional: {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  },
  // tables: ['table1', 'table2', 'myschema.table3'] // use all tables, if omitted
}

const auto = new SequelizeAuto(sequelize, null, null, options);

// console.log(auto);

auto.run();