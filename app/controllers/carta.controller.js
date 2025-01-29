const Product = require('../models/product.model');
const Carta = require('../models/carta.model');
const Order = require('../models/order.model'); // Assuming you have an Order model

const mongoose = require('mongoose');

exports.addToCarta = async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    // Find product with all details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create cart
    let cart = await Carta.findOne({ cartId });
    
    if (!cart) {
      // Create new cart with product details
      cart = new Carta({
        cartId,
        items: [{
          product: productId,
          quantity: Number(quantity) || 1,
          price: Number(product.price),
          productName: product.name,
          productImage: product.files?.[0]?.url || product.image,
          brand: product.brand
        }]
      });
    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update existing item quantity
        cart.items[itemIndex].quantity += Number(quantity) || 1;
      } else {
        // Add new item to cart with product details
        cart.items.push({
          product: productId,
          quantity: Number(quantity) || 1,
          price: Number(product.price),
          productName: product.name,
          productImage: product.files?.[0]?.url || product.image,
          brand: product.brand
        });
      }
    }

    // Calculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ 
      items: cart.items,
      total: cart.total 
    });

  } catch (error) {
    console.error("Error in addToCarta:", error);
    res.status(500).json({ 
      message: "Error adding to cart", 
      error: error.message 
    });
  }
};





exports.getCarta = async (req, res) => {
  const { cartId } = req.params; // Récupérer l'ID de panier à partir des paramètres de la route

  try {
      // Trouver le panier spécifique en utilisant l'ID de panier
      const cart = await Carta.findOne({ cartId: cartId }).populate('items.product');
      if (!cart) {
          return res.status(404).json({ message: "Cart not found" });
      }
      res.status(200).json(cart);
  } catch (error) {
      res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};
exports.updateCartWithUserInfo = async (req, res) => {
  const { cartId } = req.params;
  const { userInfo } = req.body;

  try {
      // Mise à jour du panier avec les informations utilisateur
      const updatedCart = await Carta.findOneAndUpdate(
          { cartId: cartId },  // Utiliser findOneAndUpdate avec un filtre sur cartId
          { userInfo: userInfo },
          { new: true, runValidators: true }
      ).populate('items.product');

      if (!updatedCart) {
          return res.status(404).json({ message: "Cart not found" });
      }
      res.status(200).json(updatedCart);
  } catch (error) {
      console.error("Error in updateCartWithUserInfo:", error);
      res.status(500).json({ message: "Error updating cart with user info", error: error.message });
  }
};
exports.updateItemQuantity = async (req, res) => {
  const { cartId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Carta.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity
    cart.items[itemIndex].quantity += quantity;

    // Remove item if quantity becomes 0 or negative
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/,/g, ''));
      return total + (price * item.quantity);
    }, 0).toString();

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({ message: "Error updating item quantity", error: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { cartId, itemId } = req.params; // Retrieve cartId and itemId from the request params
  const { userId } = req.query; // Retrieve userId from the query parameters

  try {
    // Validate cart existence
    const cart = await Carta.findOne({ cartId, userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found or user does not own this cart" });
    }

    // Find the index of the item to remove
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Save the cart and return the updated items
    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ items: cart.items });
  } catch (error) {
    console.error("Error in removeItemFromCart:", error);
    res.status(500).json({ message: "Error removing item from cart", error: error.message });
  }
};



exports.getAllCarts = async (req, res) => {
  try {
    // Fetch all carts from the database
    const carts = await Carta.find().populate('items.product');

    // Check if any carts were found
    if (!carts.length) {
      return res.status(404).json({ message: "No carts found" });
    }

    // Successfully return the fetched carts
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error in getAllCarts:", error);
    res.status(500).json({ message: "Error fetching carts", error: error.message });
  }
};




exports.countCarts = async (req, res) => {
  try {
    const cartCount = await Carttwo.countDocuments();
    res.status(200).json({ cartCount });
  } catch (error) {
    console.error("Error counting carts:", error);
    res.status(500).json({ message: "Error counting carts", error: error.message });
  }
};




exports.countCartsByWeek = async (req, res) => {
  try {
    // Récupérer les dates de début et de fin du corps de la requête, ou utiliser la date actuelle du système
    let { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      const now = new Date();
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Lundi
      const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7)); // Dimanche
      
      startDate = startDate || firstDayOfWeek.toISOString().split('T')[0];
      endDate = endDate || lastDayOfWeek.toISOString().split('T')[0];
    }

    // Convertir les dates en objets Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ajouter un jour à la date de fin pour inclure le dernier jour complet
    end.setDate(end.getDate() + 1);

    const cartsByWeek = await Carta.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 }
      }
    ]);

    res.status(200).json(cartsByWeek);
  } catch (error) {
    console.error("Error counting carts by week:", error);
    res.status(500).json({ message: "Error counting carts by week", error: error.message });
  }
};

exports.incrementItemQuantity = async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    // Find the cart
    const cart = await Carta.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Increment the item's quantity
    cart.items[itemIndex].quantity += 1;

    // Recalculate the total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ 
      items: cart.items,
      total: cart.total 
    });
  } catch (error) {
    console.error("Error incrementing item quantity:", error);
    res.status(500).json({ 
      message: "Error incrementing item quantity", 
      error: error.message 
    });
  }
};


exports.decrementItemQuantity = async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    // Find the cart
    const cart = await Carta.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Decrement the item's quantity
    cart.items[itemIndex].quantity -= 1;

    // If the quantity is 0 or less, remove the item from the cart
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate the total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ 
      items: cart.items,
      total: cart.total 
    });
  } catch (error) {
    console.error("Error decrementing item quantity:", error);
    res.status(500).json({ 
      message: "Error decrementing item quantity", 
      error: error.message 
    });
  }
};



