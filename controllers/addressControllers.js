const { Op } = require("sequelize");
const sequelize = require("sequelize");
const userSchema = require("../models/userModel");
const addressSchema = require("../models/addressModels");

const addAddress = async (req, res) => {
  try {
    const address = new addressSchema(req.body);
    const isDefaultAddress = await addressSchema.findOne({where: {UserId: req.userID}})
    if(isDefaultAddress){
      address.UserId = req.userID;
      await address.save();
    } else {
      address.UserId = req.userID
      address.isDefault = true
      await address.save()
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
    const first = country ? { country: { [Op.like]: `%${country}%` } } : null;
    const second = city ? { city: { [Op.like]: `%${city}%` } } : null;
    const search = await addressSchema.findAll({
      where: {
        [Op.or]: [first, second],
      },
      include: [
        {
          model: userSchema,
          as: "add",
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Address fetch successfully",
      data: search,
    });
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
  changeDefaultAddress,
};
