const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models/index");
const { Address, User, ContactUs } = models;
const { Op, where } = require("sequelize");
const sequelize = require("sequelize");
const { generateEjsTemplate, generatePdf, imgEncoding } = require('../service/index')
const moment = require("moment");
moment.suppressDeprecationWarnings = true;

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdminExists = await User.findOne({ where: { email: email } });
    if (isAdminExists) {
      const pass = await bcrypt.compare(password, isAdminExists.password);
      if (pass) {
        let token = await jwt.sign(
          { userID: isAdminExists },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({
          success: true,
          message: "Login successfully",
          email: isAdminExists.email,
          firstName: isAdminExists.firstName,
          lastName: isAdminExists.lastName,
          token: token,
        });
      } else {
        res.status(402).json({
          success: false,
          message: "Email or password is wrong",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "User not registered with this email",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const removeAddress = async (req, res) => {
  try {
    const result = await new sequelize.Transaction(async (t) => {
      const isDefaultAddress = await Address.findOne({
        where: { id: req.params.id },
      });
      if (isDefaultAddress.isDefault === true) {
        res.status(401).json({
          success: false,
          message: "You can't delete default address",
        });
      } else {
        const deleteAddress = await Address.destroy({
          where: { id: req.params.id },
        });
        if (deleteAddress) {
          res.status(200).json({
            success: true,
            message: "Address removed",
          });
        }
      }
      return isDefaultAddress;
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const editAddress = async (req, res) => {
  const id = req.params.id;
  try {
    const isUserExist = await Address.findOne({ where: { id: id } });
    if (isUserExist.isDefault === false) {
      const body = req.body.address;
      const updateAddress = await Address.update(
        { address: body },
        { where: { id: id } }
      );
      res.status(202).json({
        success: true,
        message: "Address updated successfully",
        data: updateAddress,
      });
      return isUserExist;
    } else {
      res.status(401).json({
        success: false,
        message: "You can't update default address",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

/**
 * get current date
 */
module.exports.getCurrentDateTime = (date, format) => {
  try {
    if (date) {
      return moment(date).format(format ?? "YYYY-MM-DD");
    }
    return moment().format(format ?? "YYYY-MM-DD HH:mm:ss");
  } catch (error) {
    throw new Error(error);
  }
};

const listAllAddress = async (req, res) => {
  try {
    const { 
      country, 
      startDate, 
      endDate, 
      city, 
      limit, 
      offset,
      sortBy,
      sortType
    } = req.query;
    let where = {};
    let pagination = {};
    let startDateData;
    let endDateData;
    if (startDate) {
      startDateData = this.getCurrentDateTime(startDate);
      where.createdAt = { [Op.gte]: startDateData };
    }
    if (endDate) {
      endDateData = this.getCurrentDateTime(endDate);
      where.createdAt = { [Op.lte]: `${endDateData}:23:59:59` };
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDateData, `${endDateData}:23:59:59`],
      };
    }
    if (country) {
      where.country = { [Op.like]: `%${country}%` };
    }
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }
    if (offset && limit) {
      pagination.limit = parseInt(Math.abs(limit), 10);
      pagination.offset = parseInt(Math.abs(offset), 10);
    } else if (limit) {
      pagination.limit = parseInt(Math.abs(limit), 10);
    } else if (offset) {
      pagination.offset = parseInt(Math.abs(offset), 10);
      pagination.limit = 10;
    } else {
      pagination.limit = 10;
      pagination.offset = 0;
    }
    let orderBy = [["createdAt", "ASC"]]
    if(sortBy && sortType){
      switch (sortBy){
        case 'userName':
          orderBy = [[Address.associations.User, 'firstName', sortType]];
          break;
        case 'country':
          orderBy = [['country', sortType]];
          break;
        default: 
          orderBy = [[sortBy, sortType]];
          break;
      }
    }
    let searchCriteria = {
      raw: true,
      limit: pagination.limit,
      offset: pagination.offset,
      attributes: {
        exclude: ["updatedAt", "UserId", "isDefault"],
        include: [[sequelize.literal(`isDefault = 0`), "isEditable"]],
      },
      where: where,
      order: orderBy,
      include: [
        {
          model: User,
          attributes: ["firstName", "email", "id"],
        },
      ],
    }
    const allAddress = await Address.findAndCountAll(searchCriteria);
    res.status(200).json({
      success: true,
      message: "Address fetch successfully",
      address: allAddress,
      meta: {
        total_pages: Math.round(allAddress.count / pagination.limit),
        per_page_items: pagination.limit,
        total_items: allAddress.count,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const generateInvoice = async (req, res) => {
  try{
  let data = {
    invoiceNumber: Math.floor(Math.random() * 10000),
    invoiceDate: this.getCurrentDateTime(),
    description: "TV",
    quantity: "5",
    unitPrice: "10000"
  }
  req.data = data
  req.template = 'invoice.ejs'
  req.imgPath = 'tv.jpg'
  const imgPath = await imgEncoding(req)
  if(imgPath){
    data.productImg = imgPath
    req.imgPath = 'signature.png'
    const signature = await imgEncoding(req)
    if(signature){
      data.signature = signature
    }
  }
  const getHtml = await generateEjsTemplate(req)
  const getPdf = await generatePdf(getHtml, Math.floor(Math.random() * 100))
  res.status(201).json({
    success: true,
    message: "invoice pdf generated successfully"
  })
} catch (err) {
  res.status(400).json({
    success: false,
    error: err.message
  })
}
}
const contactUs = async (req, res) => {
  try{
  const getLink = await ContactUs.findOne({where: {id: 1}})
  let data = {
    videoLink: getLink.videoLink,
    title: getLink.title,
    description: getLink.description
  }
  req.template = 'contantUs.ejs'
  req.data = data
  const getHtml = await generateEjsTemplate(req)
  res.send(getHtml)
  res.status(201).json({
    success: true,
    message: "ejs video generated successfully"
  })
} catch (err) {
  res.status(400).json({
    success: false,
    error: err.message
  })
}
}

const contactUsCreate = async (req, res) => {
  try{
  const { body } = req;
  const data = await ContactUs.create(body)
  res.status(201).json({
    success: true,
    message: "contactus generated successfully",
    res: data
  })
} catch (err) {
  res.status(400).json({
    success: false,
    error: err.message
  })
}
}
module.exports = {
  adminLogin,
  listAllAddress,
  removeAddress,
  editAddress,
  generateInvoice,
  contactUs,
  contactUsCreate
};
