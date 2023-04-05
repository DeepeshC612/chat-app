const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Address = require("../models/addressModels");
const Admin = require("../models/userModel");
const { Op, where } = require("sequelize");
const sequelize = require("sequelize");

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
    const result = await new sequelize.Transaction(async (t) => {
      const isDefaultAddress = await Address.findOne(
        {
          where: { id: req.params.id },
        },
      );
      console.log(isDefaultAddress);
      if (isDefaultAddress.isDefault === true) {
        res.status(401).json({
          success: false,
          message: "You can't delete default address",
        });
      } else {
        const deleteAddress = await Address.destroy(
          {
            where: { id: req.params.id },
          },
          
        );
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
    const result = await sequelize.Transaction(async (t) => {
      const isUserExist = await Address.findOne(
        { where: { id: id } },
      );
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
    let country = req.query.country;
    let createdAtDate = await Address.min("createdAt");
    let ltNowDate = new Date();
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let condition1 = startDate || createdAtDate;
    let condition2 = endDate || ltNowDate;
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
    const allAddress = await Address.findAndCountAll({
      raw: true,
      limit: pageSize,
      offset: offset,
      attributes: [
        "id",
        "address",
        "city",
        "country",
        "createdAt",
        [sequelize.literal(`isDefault`), "isEditable"],
      ],
      where: {
        [Op.and]: [
          {
            [Op.and]: [conditionForCity, conditionForCountry],
          },
          {
            createdAt: {
              [Op.and]: [
                {
                  [Op.between]: [startDate, endDate],
                },
                {
                  [Op.and]: [
                    {
                      [Op.gte]: condition1,
                      [Op.lt]: condition2,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: Admin,
          as: "userAddress",
          attributes: ["firstName", "email", "id"],
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

module.exports = {
  adminLogin,
  listAllAddress,
  removeAddress,
  editAddress,
};
