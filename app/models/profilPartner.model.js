const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profilPartnerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Veuillez entrer le nom"]
  },
  slogan: {
    type: String,
    required: [false, "Veuillez entrer le slogan"]
  },
  description: {
    type: String,
    required: [true, "Veuillez entrer la description du produit"]
  },
  facebook:{
    type :String,
    required: [false,"Veuillez entrer lien facebook"]
  },
  instagram:{
    type :String,
    required: [false,"Veuillez entrer lien instagram"]
  },
  whatsapp:{
    type:String,
    required:[false,"Veuillez entrer lien whatsapp"]
  },
   phone: {
    type: String,
    required: [false, "Veuillez spécifier le numéro"],

  },
  files: [{
    public_id: String,
    url: String
  }]
});

module.exports = mongoose.model('ProfilPartner', profilPartnerSchema);
