const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');
const ProfilPartner = require('../models/profilPartner.model');


exports.createProfilPartner = async (req, res) => {
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

    // Créer un nouveau produit avec les données du formulaire et les URL des fichiers Cloudinary
    const profilPartner = new ProfilPartner({
      name: req.body.name,
      userId: req.body.userId,
      description: req.body.description,
      slogan: req.body.slogan,
     
      facebook: req.body.facebook,
      instgram:req.body.instgram,
      whatsapp: req.body.whatsapp,
      phone:req.body.phone,
      files: uploadedFiles
    });

    // Enregistrer le produit dans la base de données
    await profilPartner.save();

    res.status(201).json(profilPartner);
  } catch (error) {
    console.error("Erreur lors de la création du produit :", error); 
    res.status(500).json({ message: "Erreur lors de la création du produit", error });
  }
};

exports.getAllProfilPartners = async (req, res) => {
  try {
    const profilPartners = await ProfilPartner.find();
    res.status(200).json(profilPartners);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
};

exports.getProfilPartnerById = async (req, res) => {
  try {
    const { id } = req.params; 
    const profilPartner = await ProfilPartner.findById(id);
    if (!profilPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(profilPartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du produit", error });
  }
};



exports.updateProfilPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const profilPartner = await ProfilPartner.findById(id);
    if (!profilPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Mettre à jour les champs du produit avec les nouvelles données
    Object.keys(req.body).forEach(key => {
      profilPartner[key] = req.body[key];
    });

    // Vérifier si de nouveaux fichiers ont été téléchargés
    if (req.files && req.files.length > 0) {
      // Supprimer les anciens fichiers de Cloudinary
      await Promise.all(profilPartner.files.map(async (file) => {
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

      // Mettre à jour les fichiers du produit avec les nouvelles URL de Cloudinary
      profilPartner.files = uploadedFiles;
    }

    const updatedProfilPartner = await profilPartner.save();
    res.status(200).json(updatedProfilPartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error });
  }
};





exports.deleteProfilPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProfilPartner = await ProfilPartner.findByIdAndDelete(id);
    if (!deletedProfilPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès", deletedProfilPartner });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du produit", error });
  }
};


exports.countProfilPartners = async (req, res) => {
  try {
    const profilPartnerCount = await ProfilPartner.countDocuments();
    res.status(200).json({ profilPartnerCount });
  } catch (error) {
    console.error("Error counting profilPartners:", error);
    res.status(500).json({ message: "Error counting profilPartners", error: error.message });
  }
};
exports.countProfilPartnersByCategory = async (req, res) => {
  try {
    const profilPartnerCounts = await ProfilPartner.aggregate([
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(profilPartnerCounts);
  } catch (error) {
    console.error("Error counting profilPartners by category:", error);
    res.status(500).json({ message: "Error counting profilPartners by category", error: error.message });
  }
};

exports.getProfilPartnersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Récupère le userId depuis les paramètres de l'URL
    const profilPartners = await ProfilPartner.find({ userId: userId });
    
    if (!profilPartners || profilPartners.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur" });
    }

    res.status(200).json(profilPartners);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
};
