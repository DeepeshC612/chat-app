const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Address = require("../models/addressModels");
const Admin = require("../models/userModel");
const sequelize = require("sequelize");
const { DATE } = require("sequelize");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdminExists = await Admin.findOne({ where: { email: email } });
    if (isAdminExists) {
      const pass = await bcrypt.compare(password, isAdminExists.password);
      if (pass) {
        let token = await jwt.sign(
          { userID: isAdminExists.id },
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
    const deleteAddress = await Address.destroy({
      where: { id: req.params.id },
    });
    if (deleteAddress) {
      res.status(200).json({
        success: true,
        message: "Address removed",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const listAllAddress = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(req.query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const pageSize = limit;
    const allAddress = await Address.findAndCountAll({
      limit: pageSize,
      offset: offset,
      attributes: ["id", "address", "city", "country", "isDefault"],
      include: [
        {
          model: Admin,
          as: "userAddress",
          attributes: ["firstName", "email"],
        },
      ],
    });
    res.status(200).json({
      message: true,
      message: "Address fetch successfully",
      address: allAddress,
      meta: {
        total_pages: Math.round(allAddress.count / pageSize),
        per_page_items: pageSize,
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

const filterByDate = async (req, res) => {
  try {
    let createdAtDate = await Address.min("createdAt");
    let page = req.query.page ? req.query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(req.query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const pageSize = limit;
    const addressList = await Address.findAndCountAll({
      limit: pageSize,
      offset: offset,
      attributes: { exclude: "updatedAt" },
      where: {
        createdAt: {
          [sequelize.Op.and]: {
            [sequelize.Op.gt]: createdAtDate,
            [sequelize.Op.lt]: Date.now(),
          },
        },
      },
      include: [
        {
          model: Admin,
          as: "userAddress",
          attributes: ["firstName"],
        },
      ],
    });
    res.status(200).json({
      message: true,
      message: "Address fetch successfully",
      address: addressList,
      meta: {
        total_pages: Math.round(addressList.count / pageSize),
        per_page_items: pageSize,
        total_items: addressList.count,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

module.exports = {
  adminLogin,
  listAllAddress,
  removeAddress,
  filterByDate,
};
