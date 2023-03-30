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
          as: "userAddress",
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

const addDefaultAddress = async (req, res) => {
  try {
    const isUserExist = await Address.update(
      { isDefault: false },
      {
        where: { UserId: req.userID, isDefault: true },
      }
    );
    if (isUserExist) {
      const UserId = req.userID;
      const isDefault = true;
      let addressData = { ...req.body, UserId: UserId, isDefault: isDefault };
      await Address.create(addressData);
      const findAddress = await Address.findAll({
        where: { UserId: req.userID },
      });
      res.status(202).json({
        success: true,
        message: "Default Address set successfully",
        data: findAddress,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occur " + err.message,
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
    const conditionForCountry = country
      ? { country: { [Op.like]: `%${country}%` } }
      : null;
    const conditionForCity = city ? { city: { [Op.like]: `%${city}%` } } : null;
    let page = req.query.page ? req.query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(req.query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const pageSize = limit;
    const id = req.userID;
    const isUserExist = await Address.findAll({ where: { UserId: id } });
    if (isUserExist) {
      const addressList = await Address.findAndCountAll({
        limit: pageSize,
        offset: offset,
        attributes: ["id", "address", "city", "country", "isDefault"],
        where: {
          [Op.and]: [
            { [Op.and]: [conditionForCountry, conditionForCity] },
            { UserId: id },
          ],
        },
        include: [
          {
            model: User,
            as: "userAddress",
            attributes: ["firstName", "email", "id"],
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
    } else {
      res.status(401).json({
        success: false,
        error: "You are not authorized to access this address",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

module.exports = {
  addAddress,
  searchAndFilter,
  addDefaultAddress,
  changeDefaultAddress,
};
