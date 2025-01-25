const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productPartnerSchema = new Schema({
       userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
  name: {
    type: String,
    required: [true, "Veuillez entrer le nom du produit"]
  },
  description: {
    type: String,
    required: [true, "Veuillez entrer la description du produit"]
  },
  price:{
    type :String,
    required: [true,"Veuillez entrer le prix"]
  },
  priceTwo:{
    type :String,
    required: [false,"Veuillez entrer le prix"]
  },
  promo:{
    type:String,
    required:[false,"Veuillez entrer promo"]
  },
  type: {
    type: String,
    required: [false, "Veuillez spécifier le type"],
    enum: ['Promos', 'Best_Seller','New_Collection','Normal']  
  },

  categorie: {
    type: String,
    required: [false, "Veuillez spécifier catégorie"],
    enum: ['Kids', 'Mens','Womens','Home','Beauty','Gifts']  
  },

  rating: {
    type: String,
    required: [false, "Veuillez spécifier rating"],
    enum: ['1', '2','3','4','5']  
  },
 
  files: [{
    public_id: String,
    url: String
  }]
});

module.exports = mongoose.model('ProductPartner', productPartnerSchema);
