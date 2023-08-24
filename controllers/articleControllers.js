// const { sequelize } = require("sequelize");
const models = require("../models/index");
const { ArticleTag, Article, ArticleTagStore, sequelize } = models;
const { Op, QueryTypes } = require("sequelize");

module.exports.addTags = async (req, article, commonId) => {
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
    for (let i = 0; i < tagsArray.length; i++) {
      const isTagExist = await ArticleTag.findOne({
        where: { name: tagsArray[i] },
      });
      if (isTagExist) {
        await ArticleTagStore.create({
          tag_Id: isTagExist.id,
          article_Id: article.id,
          common_Id: commonId.common_Id,
        });
      }
    }
    return true;
  } catch (error) {
    res.json({
      error: error,
    });
  }
};

/**
 * Create Articles
 * @param {object} req
 * @returns
 */
const createArticle = async (req, res) => {
  try {
    //const t = await sequelize.transaction();
    const body = {
      title: req.body.title,
      description: req.body.description,
      userId: req.userID,
      common_Id: req.userID + 22,
    };
    // Creating Article
    const article = await Article.create(body);
    await Article.update(
      { common_Id: article.id + 22 },
      { where: { id: article.id } }
    );
    const commonId = await Article.findOne({ where: { id: article.id } });
    // Find tags are exists
    const value = await this.addTags(req, article, commonId);
    if (value) {
      //await t.commit();
      // Fetch created article tag
      const findArticle = await Article.findOne({
        where: { id: article.id },
        include: [{ model: ArticleTagStore }],
      });
      res.status(201).json({
        success: true,
        data: findArticle,
      });
    } else {
      //await t.rollback();
      res.json({
        success: false,
        error: "Error",
      });
    }
  } catch (error) {
    res.json({
      error: "api error" + error,
    });
  }
};

/**
 * Create Tags
 * @param {object} req
 * @returns
 */
const createTag = async (req, res) => {
  try {
    const tag = req.body.name;
    const createTag = await ArticleTag.create({ name: tag });
    res.status(201).json({
      success: true,
      data: createTag,
    });
  } catch (error) {
    res.json({
      error: error,
    });
  }
};

/**
 * List Tags
 * @param {object} req
 * @returns
 */
const listTag = async (req, res) => {
  try {
    let tag1 = req.query.tag1;
    let tag2 = req.query.tag2;
    let tag3 = req.query.tag3;
    let Condition1 = tag1 ? tag1 : null;
    let Condition2 = tag2 ? tag2 : null;
    let Condition3 = tag3 ? tag3 : null;
    let newArray = [];
    const projects = await sequelize.query(
      `SELECT articles.id FROM articles
       INNER JOIN articletagstores ON articles.id = articletagstores.article_Id 
       AND articletagstores.tag_Id IN (SELECT id FROM articletags WHERE name IN('${Condition1}', '${Condition2}', '${Condition3}'))
       GROUP BY articles.id
       HAVING COUNT(articles.id) = 
       (SELECT COUNT(id) FROM articletags WHERE name IN('${Condition1}', '${Condition2}', '${Condition3}'))`,
      {
        type: QueryTypes.SELECT,
      }
    );
    for(let i=0; i<projects.length; i++){
      newArray.push(projects[i].id)
    }
    const listArticle = await Article.findAll({
      where: {id: newArray},
      include: [{
        model: ArticleTagStore,
        attributes: ['id'],
        include: [{
          model: ArticleTag,
          attributes: ['id','name'],
          duplicating: false
        }],
        duplicating: false
      }],
      duplicating: false
    })
    res.status(200).json({
      success: true,
      data: listArticle,
    });
  } catch (error) {
    res.json({
      error: "error by api " + error,
    });
  }
};

module.exports = {
  createTag,
  createArticle,
  listTag,
};
