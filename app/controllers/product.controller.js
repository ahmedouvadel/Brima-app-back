const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');
const Product = require('../models/product.model');


exports.createProduct = async (req, res) => {
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
    const product = new Product({
      name: req.body.name,
      brand: req.body.brand,
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
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du produit", error });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; 
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du produit", error });
  }
};



exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Mettre à jour les champs du produit avec les nouvelles données
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    // Vérifier si de nouveaux fichiers ont été téléchargés
    if (req.files && req.files.length > 0) {
      // Supprimer les anciens fichiers de Cloudinary
      await Promise.all(product.files.map(async (file) => {
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
      product.files = uploadedFiles;
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error });
  }
};





exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès", deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du produit", error });
  }
};


exports.countProducts = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.status(200).json({ productCount });
  } catch (error) {
    console.error("Error counting products:", error);
    res.status(500).json({ message: "Error counting products", error: error.message });
  }
};
exports.countProductsByCategory = async (req, res) => {
  try {
    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(productCounts);
  } catch (error) {
    console.error("Error counting products by category:", error);
    res.status(500).json({ message: "Error counting products by category", error: error.message });
  }
};