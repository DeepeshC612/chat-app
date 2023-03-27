const { Op } = require("sequelize");
const User = require("../models/userModel");
const Address = require("../models/addressModels");

const addAddress = async (req, res) => {
  try {
    const isDefaultAddress = await Address.findOne({
      where: { UserId: req.userID },
    });
    if (isDefaultAddress) {
      const UserId = req.userID;
      let addressData = { ...req.body, UserId: UserId };
      await Address.create(addressData);
    } else {
      const UserId = req.userID;
      const isDefault = true;
      let addressData = { ...req.body, UserId: UserId, isDefault: isDefault };
      await Address.create(addressData);
    }
    const newAddress = await Address.findAll({
      include: [
        {
          model: User,
          as: "add",
        },
      ],
      where: { UserId: req.userID },
    });
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      Address: newAddress,
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
    const isUserExist = await Address.update(
      { isDefault: false },
      {
        where: { UserId: req.userID, isDefault: true },
      }
    );
    if (isUserExist) {
      await Address.update(
        { isDefault: true },
        { where: { id: req.params.id } }
      );
      res.status(202).json({
        success: true,
        message: "Default Address set successfully",
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
    const addressList = await Address.findAndCountAll({
      limit: pageSize,
      offset: offset,
      where: {
        [Op.and]: [conditionForCity, conditionForCountry],
      },
      include: [
        {
          model: User,
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
    const allAddress = await Address.findAndCountAll({
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: User,
          as: "add",
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
  } catch (err) {}
};

module.exports = {
  addAddress,
  searchAndFilter,
  changeDefaultAddress,
  listAllAddress,
};
