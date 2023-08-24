const database = require("./database-services");
const { generateEjsTemplate } = require("./ejs.service");
const { generatePdf } = require("./pdf-generator.service");
const { imgEncoding } = require("./img-encode.service");

module.exports = {
  database,
  generateEjsTemplate,
  generatePdf,
  imgEncoding
};
