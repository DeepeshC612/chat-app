const models = require("../models/index.js");
const { ArticleTag } = models;

/**
 ** Function to find tags
 * @param {object}
 * @returns
 */
module.exports.findMultipleTags = async (req, tagsArray) => {
  try {
    for (let i = 0; i < tagsArray.length; i++) {
      const isTagExist = await ArticleTag.findOne({
        where: { name: tagsArray[i] },
      });
      if (!isTagExist) {
        return false;
      }
    }
    if (tagsArray.length <= 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    articleErrorMessage("articleAdd", { error, data: req?.body });
    throw Error(error);
  }
};

const findMultipleTags = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.title, delete data.description;
    const save = Object.values(data);
    const tagsArray = [];
    save.forEach((ele) => {
      if (ele != "") {
        tagsArray.push(ele);
      }
    });
    const findTags = await this.findMultipleTags(req, tagsArray);
    if (findTags) {
      next();
    } else {
      res.status(401).json({
        success: false,
        error: "error accure by me"
      })
    }
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "middleware error" + err
    })
  }
};

module.exports = { findMultipleTags };
