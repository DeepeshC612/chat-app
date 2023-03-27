const { Op } = require("sequelize");
const sequelize = require("sequelize");
const userSchema = require("../models/userModel");
const addressSchema = require("../models/addressModels");

const addAddress = async (req, res) => {
  try {
    const isDefaultAddress = await addressSchema.findOne({
      where: { UserId: req.userID },
    });
    if (isDefaultAddress) {
      const UserId = req.userID;
      let addressData = { ...req.body, UserId: UserId };
      await addressSchema.create(addressData);
    } else {
      const UserId = req.userID;
      const isDefault = true;
      let addressData = { ...req.body, UserId: UserId, isDefault: isDefault };
      await addressSchema.create(addressData);
    }
    const newAddress = await addressSchema.findAll({
      include: [
        {
          model: userSchema,
          as: "add",
        },
      ],
      where: { UserId: req.userID },
    });
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const changeDefaultAddress = async (req, res) => {
  try {
    const isUserExist = await addressSchema.update(
      { isDefault: false },
      {
        where: { UserId: req.userID, isDefault: true },
      }
    );
    if (isUserExist) {
      await addressSchema.update(
        { isDefault: true },
        { where: { id: req.params.id } }
      );
      res.status(202).json({
        success: true,
        message: "Default address set successfully",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occur " + err.message,
    });
  }
};

const searchAndFilter = async (req, res) => {
  try {
    let country = req.query.country;
    let city = req.query.city;
    const conditionForCountry = { country: { [Op.like]: `%${country}%` } };
    const conditionForCity = { city: { [Op.like]: `%${city}%` } };
    let page = req.query.page ? req.query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(req.query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const pageSize = limit;
    const addressList = await addressSchema.findAndCountAll({
      limit: pageSize,
      offset: offset,
      where: {
        [Op.and]: [conditionForCity, conditionForCountry],
      },
      include: [
        {
          model: userSchema,
          as: "add",
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

const listAllAddress = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(req.query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const pageSize = limit;
    const allAddress = await addressSchema.findAll({
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: userSchema,
          as: "add",
          attributes: ["firstName"],
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
  } catch (err) {}
};

module.exports = {
  addAddress,
  searchAndFilter,
  changeDefaultAddress,
  listAllAddress,
};
