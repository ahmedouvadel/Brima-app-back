const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const partnerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Veuillez entrer le nom"]
  },
  description: {
    type: String,
    required: [true, "Veuillez entrer la description "]
  },
  phone :{
    type: String,
    required: [true, "Veuillez entrer le numéro de téléphone"]
  },
  facebook:{
    type: String,
    required: [true, "Veuillez entrer le lien vers Facebook"]
  },
  instgram:{
    type: String,
    required: [true, "Veuillez entrer le lien vers Instagram"]
  },
  produit: {
    type: Schema.Types.ObjectId,
    ref: 'Produit',
    required: false,
  },
  files: [{
    public_id: String,
    url: String
  }]
});
module.exports = mongoose.model('Partner', partnerSchema);