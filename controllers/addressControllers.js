const { Op } = require("sequelize");
const models = require("../models/index");
const { Address, User, sequelize } = models;

/**
 * Function for fetching address
 * @param req
 * @returns
 */
module.exports.findAddress = async (req, address) => {
  const result = await Address.findAll({
    include: [
      {
        model: User,
        where: { id: req.userID.id },
        attributes: ["firstName", "email"],
      },
    ],
    where: { id: address.id },
  });
  return result;
};

const addAddress = async (req, res) => {
  try {
    const isDefaultAddress = await Address.findOne({
      where: { UserId: req.userID.id },
    });
    if (isDefaultAddress) {
      const UserId = req.userID.id;
      let addressData = { ...req.body, UserId: UserId };
      let address = await Address.create(addressData);
      let findAddress = await this.findAddress(req, address);
      res.status(201).json({
        success: true,
        message: "Address created successfully",
        Address: findAddress,
      });
    } else {
      const UserId = req.userID.id;
      const isDefault = true;
      let addressData = { ...req.body, UserId: UserId, isDefault: isDefault };
      let address = await Address.create(addressData);
      let findAddress = await this.findAddress(req, address);
      res.status(201).json({
        success: true,
        message: "Address created successfully",
        Address: findAddress,
      });
    }
    return isDefaultAddress;
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
        where: { UserId: req.userID.id, isDefault: true },
      }
    );
    if (isUserExist) {
      const UserId = req.userID.id;
      const isDefault = true;
      let addressData = { ...req.body, UserId: UserId, isDefault: isDefault };
      await Address.create(addressData);
      const findAddress = await Address.findAll({
        where: { UserId: req.userID.id },
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
        where: { UserId: req.userID.id, isDefault: true },
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
    const { userID } = req;
    const { country, city, offset, limit } = req.query;
    let where = {}
    let pagination = {}
    if(country){
      where.country = { [Op.like]: `%${country}%` }
    }
    if(city){
      where.city = { [Op.like]: `%${city}%` }
    }
    if(offset && limit){
      pagination.limit = parseInt(Math.abs(limit), 10) 
      pagination.offset = parseInt(Math.abs(offset), 10)
    } else if(limit){
      pagination.limit = parseInt(Math.abs(limit), 10)
    } else if(offset){
      pagination.offset = parseInt(Math.abs(offset), 10)
      pagination.limit = 10
    } else {
      pagination.limit = 10
      pagination.offset = 0
    }
    const id = userID.id
    if(id){
      where.UserId = id
    }
    const isUserExist = await Address.findAll({ where: { UserId: id } });
    if (isUserExist) {
      const addressList = await Address.findAndCountAll({
        attributes: ["id", "address", "city", "country", "isDefault"],
        where: where,
        include: [
          {
            model: User,
            attributes: ["firstName", "email", "id"],
          },
        ],
        limit: pagination.limit,
        offset: pagination.offset,
      });
      res.status(200).json({
        message: true,
        message: "Address fetch successfully",
        address: addressList,
        meta: {
          total_pages: Math.round(addressList.count / pagination.limit),
          per_page_items: pagination.limit,
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

const findOneAddress = async (req, res) => {
  try {
    const data = await Address.scope("city").findAll();
    res.json({
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Error occur " + error.message,
    });
  }
};

module.exports = {
  addAddress,
  searchAndFilter,
  addDefaultAddress,
  changeDefaultAddress,
  findOneAddress,
};
