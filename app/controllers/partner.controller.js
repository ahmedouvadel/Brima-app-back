const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const fs = require('fs'); 
const stream = require('stream');
const path = require('path');
const Partner = require('../models/partner.model');


exports.createPartner = async (req, res) => {
  try {
    // Créer un tableau de fichiers à partir des fichiers téléchargés
    const files = req.files.map(file => ({
      public_id: file.filename, // Utilisez le nom de fichier temporaire généré par multer comme public_id
      url: file.path // Utilisez le chemin local du fichier temporaire comme URL temporaire
    }));

    // Ajouter les fichiers à Cloudinary et obtenir les URL Cloudinary
    const uploadedFiles = await Promise.all(files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.url);
      return {
        public_id: result.public_id,
        url: result.secure_url
      };
    }));

    // Créer un nouveau partner avec les données du formulaire et les URL des fichiers Cloudinary
    const partner = new Partner({
      name: req.body.name,
    
      description: req.body.description,
   
      phone: req.body.phone,
      facebook: req.body.facebook,

      instgram:req.body.instgram,
      produit: req.body.produit,
    
      files: uploadedFiles
    });

    // Enregistrer le partner dans la base de données
    await partner.save();

    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du partner", error });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des partners", error });
  }
};

exports.getPartnerById = async (req, res) => {
  try {
    const { id } = req.params; 
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: "partner non trouvé" });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du partner", error });
  }
};



exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: "partner non trouvé" });
    }

    // Mettre à jour les champs du partner avec les nouvelles données
    Object.keys(req.body).forEach(key => {
      partner[key] = req.body[key];
    });

    // Vérifier si de nouveaux fichiers ont été téléchargés
    if (req.files && req.files.length > 0) {
      // Supprimer les anciens fichiers de Cloudinary
      await Promise.all(partner.files.map(async (file) => {
        await cloudinary.uploader.destroy(file.public_id);
      }));

      // Télécharger les nouveaux fichiers sur Cloudinary
      const uploadedFiles = await Promise.all(req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        // Supprimer le fichier local après téléchargement s'il existe
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return {
          public_id: result.public_id,
          url: result.secure_url
        };
      }));

      // Mettre à jour les fichiers du partner avec les nouvelles URL de Cloudinary
      partner.files = uploadedFiles;
    }

    const updatedPartner = await partner.save();
    res.status(200).json(updatedPartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du partner", error });
  }
};





exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPartner = await Partner.findByIdAndDelete(id);
    if (!deletedPartner) {
      return res.status(404).json({ message: "partner non trouvé" });
    }
    res.status(200).json({ message: "partner supprimé avec succès", deletedPartner });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du partner", error });
  }
};


exports.countPartners = async (req, res) => {
  try {
    const partnerCount = await Partner.countDocuments();
    res.status(200).json({ partnerCount });
  } catch (error) {
    console.error("Error counting partners:", error);
    res.status(500).json({ message: "Error counting partners", error: error.message });
  }
};
