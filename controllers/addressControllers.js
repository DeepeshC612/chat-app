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
      where: { id: id },
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

module.exports = {
    addAddress
}
