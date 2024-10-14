const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');
const { defaultPerPageRecord } = require('./../config');

/**
 *
 * @param {*} json convert json object to javascript object
 */
exports.toObject = (json) => JSON.parse(JSON.stringify(json));

/**
 * Remove fields from response object
 * @param {*} obj
 * @param {*} keys
 * @param {*} defaultFields
 */
exports.removeFields = (obj, keys, defaultFields = true) => {
  let isObject = false;
  if (!(obj instanceof Array)) isObject = true;

  obj = obj instanceof Array ? obj : [obj];
  keys = typeof keys === "string" ? [keys] : keys || [];

  if (defaultFields) keys = this.excludeFields(keys);

  obj.forEach(data => {
    keys.forEach(key => {
      if (data.dataValues) delete data.dataValues[key];
      else delete data[key];
    });
  });

  if (isObject) return obj[0];
  return obj;
}

/**
 * Exclude fields form find methods
 */
exports.excludeFields = (keys, isDefault = true) => {
  keys = typeof keys === "string" ? [keys] : keys || [];
  const defaultFields = ['is_deleted', 'updated_at', 'deleted_at', 'encrypted_password', 'fingerprint'];
  if (isDefault) keys = keys.concat(defaultFields);
  return keys;
}

/**
 * Generate custom joi message
  @param {} data pass the filed name which we validate
 */
exports.errorMessage = (data, message = null, min = null, max = null) => {
  return {
    'string.base': message ? `${data} ${message}` : `${data} must be a string.`,
    'string.pattern.base': message ? `${data} ${message}` : `${data} invalid.`,
    'string.empty': message ? `${data} ${message}` : `${data} can't be blank.`,
    'any.required': message ? `${data} ${message}` : `${data} can't be blank.`,
    'string.alphanum': message ? `${data} ${message}` : `${data} must only contain alpha-numeric characters.`,
    'number.max': message ? `${data} ${message}` : `${data} must be less than or equal to ${max}.`,
    'number.min': message ? `${data} ${message}` : `${data} must be greater than or equal to ${min}.`,
    'number.base': message ? `${data} ${message}` : `${data} must be a number.`,
    'array.base': message ? `${data} ${message}` : `${data} must be an array.`,
    'any.only': message ? `${data} ${message}` : `${data} is not included in list.`,
    'array.length': message ? `${data} ${message}` : `${data} must contains items.`,
    'string.email': message ? `${data} ${message}` : `${data} must be valid.`,
    'array.sparse': message ? `${data} ${message}` : `${data} must not be a sparse array item.`,
    'array.includesRequiredUnknowns': message ? `${data} ${message}` : `${data} required parameter missing.`,
    'date.greater': message ? `${data} ${message}` : `${data} must be greater than ${new Date().toISOString()}`,
    'date.max': message ? `${data} ${message}` : `${data} invalid .`,
    'number.integer': message ? `${data} ${message}` : `${data} must be an integer.`,
    'date.base': message ? `${data} ${message}` : `Please enter valid date in ${data}.`,
    'string.max': message ? `${data} ${message}` : `${data} length must be less than or equal to ${max} characters long.`,
    'string.min': message ? `${data} ${message}` : `${data} length must be greater than or equal to ${min} characters long.`
  };
}

/**
 *
 * @param {string} plainTextPas pass string you want to hash
 * @returns {String} hashed value
 */
exports.hashIt = async (plainTextPas) => {
  const salt = await bcrypt.genSalt(12);
  const hashed = bcrypt.hashSync(plainTextPas, salt);
  return hashed;
};

/**
 * Generate random numbers
 * Generate grid numbers in range
 * @param {number} min Minimum value of grid
 * @param {number} max Maximum value of grid
 * @param {number} n Number of value you want
 * @param {array} val Array of number
 */
exports.generateRandomNumber = (min, max, n, val = []) => {
  if (n) {
    const number = Math.ceil((Math.random() * (max - min)) + min);
    n--;
    val.push(number);
    this.generateRandomNumber(min, max, n, val);
  }
  return val;
};

/**
 * Return pagination params
 * @param currentPage Current page number
 * @param count Total number of records
 * @param perPage Number of record you want in single page
 */
exports.paginate = ({ currentPage = 1, count = 0, perPage = defaultPerPageRecord }) => {
  currentPage = Number(currentPage);
  const pageCount = count !== 0 ? Math.ceil(count / Number(perPage)) : 1;
  const offset = (currentPage ? Number(currentPage) - 1 : 0) * Number(perPage);
  const limit = Number(perPage);
  return { currentPage, pageCount, offset, limit, perPage };
};
