const { Op } = require("sequelize");
const addressSchema = require("../models/addressModels");
const userSchema = require("../models/userModel");

const addAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const address = new addressSchema(req.body);
    address.isDefault = req.body.address;
    address.UserId = id;
    await address.save();
    const newAddress = await addressSchema.findAll({
      include: [
        {
          model: userSchema,
          as: "add",
        },
      ],
      where: {UserId: id}
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
    const addressId = req.query.add;
    const userId = req.query.user;
    const isAddressExist = await addressSchema.findByPk(addressId);
    const isUserExist = await userSchema.findByPk(userId);
    if (isAddressExist && isUserExist) {
      const previousDefaultAddress = { address: isAddressExist.isDefault };
      const updateIsDefaultAddress = await addressSchema.update(
        { isDefault: req.body.address },
        {
          where: { id: addressId },
        }
      );
      const productImage = await userSchema.update(previousDefaultAddress, {
        where: { id: userId },
      });
      res.status(200).json({
        success: true,
        message: "Default address update successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "address not found",
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
  changeDefaultAddress
};
