const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formulairePartnerSchema = new Schema({
  Companyname: {
    type: String,
    required: [true, "Veuillez entrer le nom du produit"]
  },
  Address: {
    type: String,
    required: [false, "Veuillez entrer l'adress "]
  },
  PhoneNumber: {
    type: String,
    required: [true, "Veuillez entrer la PhoneNumber du produit"]
  },
  Activity:{
    type :String,
    required: [true,"Veuillez entrer lactivity"]
  },
  Governorate:{
    type :String,
    required: [true,"Veuillez entrer gov"]
  },
  Email:{
    type :String,
    required: [true,"Veuillez entrer gov"]
  },

  status: {
    type: String,
    required: [false, "Veuillez status"],
    enum: ['accepted', 'rejected', 'encours'],
    default: 'encours'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    public_id: String,
    url: String
  }]
});

module.exports = mongoose.model('FormulairePartner', formulairePartnerSchema);
