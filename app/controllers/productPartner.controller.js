const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');
const ProductPartner = require('../models/productPartner.model');


exports.createProductPartner = async (req, res) => {
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
    const productPartner = new ProductPartner({
      name: req.body.name,
      userId: req.body.userId,
      description: req.body.description,
      price: req.body.price,
      priceTwo: req.body.priceTwo,
      promo: req.body.promo,
      categorie:req.body.categorie,
      rating: req.body.rating,
      type:req.body.type,
      files: uploadedFiles
    });

    // Enregistrer le produit dans la base de données
    await productPartner.save();

    res.status(201).json(productPartner);
  } catch (error) {
    console.error("Erreur lors de la création du produit :", error); 
    res.status(500).json({ message: "Erreur lors de la création du produit", error });
  }
};

exports.getAllProductPartners = async (req, res) => {
  try {
    const productPartners = await ProductPartner.find();
    res.status(200).json(productPartners);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
};

exports.getProductPartnerById = async (req, res) => {
  try {
    const { id } = req.params; 
    const productPartner = await ProductPartner.findById(id);
    if (!productPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(productPartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du produit", error });
  }
};



exports.updateProductPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const productPartner = await ProductPartner.findById(id);
    if (!productPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Mettre à jour les champs du produit avec les nouvelles données
    Object.keys(req.body).forEach(key => {
      productPartner[key] = req.body[key];
    });

    // Vérifier si de nouveaux fichiers ont été téléchargés
    if (req.files && req.files.length > 0) {
      // Supprimer les anciens fichiers de Cloudinary
      await Promise.all(productPartner.files.map(async (file) => {
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
      productPartner.files = uploadedFiles;
    }

    const updatedProductPartner = await productPartner.save();
    res.status(200).json(updatedProductPartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error });
  }
};





exports.deleteProductPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProductPartner = await ProductPartner.findByIdAndDelete(id);
    if (!deletedProductPartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès", deletedProductPartner });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du produit", error });
  }
};


exports.countProductPartners = async (req, res) => {
  try {
    const productPartnerCount = await ProductPartner.countDocuments();
    res.status(200).json({ productPartnerCount });
  } catch (error) {
    console.error("Error counting productPartners:", error);
    res.status(500).json({ message: "Error counting productPartners", error: error.message });
  }
};
exports.countProductPartnersByCategory = async (req, res) => {
  try {
    const productPartnerCounts = await ProductPartner.aggregate([
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(productPartnerCounts);
  } catch (error) {
    console.error("Error counting productPartners by category:", error);
    res.status(500).json({ message: "Error counting productPartners by category", error: error.message });
  }
};

exports.getProductPartnersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Récupère le userId depuis les paramètres de l'URL
    const productPartners = await ProductPartner.find({ userId: userId });
    
    if (!productPartners || productPartners.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé pour cet utilisateur" });
    }

    res.status(200).json(productPartners);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
};
