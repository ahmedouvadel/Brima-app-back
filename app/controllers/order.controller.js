const Order = require("../models/order.model");
const Carta = require("../models/carta.model");

exports.createOrderFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { userId, location } = req.body;

    const cart = await Carta.findOne({ cartId });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const order = new Order({
      userId,
      items: cart.items,
      total: cart.total,
      location,
      status: "Pending",
    });

    await order.save();
    await Carta.deleteOne({ cartId });

    res.status(201).send({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};
