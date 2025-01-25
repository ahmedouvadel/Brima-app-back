const mongoose = require('mongoose');

const cartaSchema = new mongoose.Schema({
  cartId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    }
  }],
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add a pre-save hook to populate product details
cartaSchema.pre('save', async function(next) {
  try {
    if (this.isModified('items')) {
      await this.populate('items.product');
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Carta = mongoose.model('Carta', cartaSchema);

module.exports = Carta;