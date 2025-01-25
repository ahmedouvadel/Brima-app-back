const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const fs = require('fs'); 
const stream = require('stream');
const path = require('path');
const FormulairePartner = require('../models/formulairePartner.model');


// exports.createFormulairePartner = async (req, res) => {
//   try {
//     // Créer un tableau de fichiers à partir des fichiers téléchargés
//     const files = req.files.map(file => ({
//       public_id: file.filename, // Utilisez le nom de fichier temporaire généré par multer comme public_id
//       url: file.path // Utilisez le chemin local du fichier temporaire comme URL temporaire
//     }));

//     // Ajouter les fichiers à Cloudinary et obtenir les URL Cloudinary
//     const uploadedFiles = await Promise.all(files.map(async (file) => {
//       const result = await cloudinary.uploader.upload(file.url);
//       return {
//         public_id: result.public_id,
//         url: result.secure_url
//       };
//     }));

//     // Créer un nouveau formulairePartner avec les données du formulaire et les URL des fichiers Cloudinary
//     const formulairePartner = new FormulairePartner({
//       Companyname: req.body.Companyname,
//       Address: req.body.Address,
//       Email: req.body.Email,
//       PhoneNumber: req.body.PhoneNumber,
//       Activity:req.body.PhoneNumber,
//       Governorate:req.body.Governorate,
//       files: uploadedFiles
//     });

//     // Enregistrer le formulairePartner dans la base de données
//     await formulairePartner.save();

//     res.status(201).json(formulairePartner);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la création du formulairePartner", error });
//   }
// };


exports.createFormulairePartner = async (req, res) => {
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

    // Créer un nouveau formulairePartner avec les données du formulaire, les URL des fichiers Cloudinary et l'ID de l'utilisateur
    const formulairePartner = new FormulairePartner({
      Companyname: req.body.Companyname,
      Address: req.body.Address,
      Email: req.body.Email,
      PhoneNumber: req.body.PhoneNumber,
      Activity: req.body.Activity,
      Governorate: req.body.Governorate,
      files: uploadedFiles,
      userId: req.body.userId // Assurez-vous que userId est inclus dans le corps de la requête
    });

    // Enregistrer le formulairePartner dans la base de données
    await formulairePartner.save();

    res.status(201).json(formulairePartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du formulairePartner", error });
  }
};


exports.getAllFormulairePartners = async (req, res) => {
  try {
    const formulairePartners = await FormulairePartner.find();
    res.status(200).json(formulairePartners);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des formulairePartners", error });
  }
};

exports.getFormulairePartnerById = async (req, res) => {
  try {
    const { id } = req.params; 
    const formulairePartner = await FormulairePartner.findById(id);
    if (!formulairePartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(formulairePartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du formulairePartner", error });
  }
};


exports.updateFormulairePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const formulairePartner = await FormulairePartner.findById(id);
    if (!formulairePartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Mettre à jour les champs du formulairePartner avec les nouvelles données
    Object.keys(req.body).forEach(key => {
      formulairePartner[key] = req.body[key];
    });

    // Vérifier si de nouveaux fichiers ont été téléchargés
    if (req.files && req.files.length > 0) {
      // Supprimer les anciens fichiers de Cloudinary
      await Promise.all(formulairePartner.files.map(async (file) => {
        await cloudinary.uploader.destroy(file.public_id);
      }));

      // Télécharger les nouveaux fichiers sur Cloudinary
      const uploadedFiles = await Promise.all(req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return {
          public_id: result.public_id,
          url: result.secure_url
        };
      }));

      // Mettre à jour les fichiers du formulairePartner avec les nouvelles URL de Cloudinary
      formulairePartner.files = uploadedFiles;
    }

    const updatedFormulairePartner = await formulairePartner.save();
    res.status(200).json(updatedFormulairePartner);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du formulairePartner", error });
  }
};



exports.deleteFormulairePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFormulairePartner = await FormulairePartner.findByIdAndDelete(id);
    if (!deletedFormulairePartner) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès", deletedFormulairePartner });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du formulairePartner", error });
  }
};

// exports.updateFormulairePartnerStatus = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;
  
//       // Vérifiez si le statut est valide
//       if (!['accepted', 'rejected', 'encours'].includes(status)) {
//         return res.status(400).json({ message: "Statut invalide" });
//       }
  
//       // Trouver le formulairePartner par ID et mettre à jour le statut
//       const formulairePartner = await FormulairePartner.findById(id);
//       if (!formulairePartner) {
//         return res.status(404).json({ message: "FormulairePartner non trouvé" });
//       }
  
//       formulairePartner.status = status;
//       const updatedFormulairePartner = await formulairePartner.save();
  
//       res.status(200).json(updatedFormulairePartner);
//     } catch (error) {
//       res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error });
//     }
//   };

const mongoose = require('mongoose');

const User = require('../models/user.model'); 
const Role = require('../models/role.model'); 

exports.updateFormulairePartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating status for FormulairePartner ID:', id);
    console.log('New status:', status);

    // Vérifiez si le statut est valide
    if (!['accepted', 'rejected', 'encours'].includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Trouver le formulairePartner par ID et mettre à jour le statut
    const formulairePartner = await FormulairePartner.findById(id);
    if (!formulairePartner) {
      console.log('FormulairePartner not found:', id);
      return res.status(404).json({ message: "FormulairePartner non trouvé" });
    }

    formulairePartner.status = status;
    const updatedFormulairePartner = await formulairePartner.save();
    console.log('Updated FormulairePartner:', updatedFormulairePartner);

    // Si le statut est accepté, changez le rôle de l'utilisateur
    if (status === 'accepted') {
      const userId = formulairePartner.userId; // Assurez-vous que userId est stocké dans formulairePartner
      console.log('Changing role for User ID:', userId);

      // Vérifiez que userId est valide
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('Invalid user ID:', userId);
        return res.status(400).json({ message: "Invalid user ID." });
      }

      // Trouver l'utilisateur par ID
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found:', userId);
        return res.status(404).json({ message: "User not found." });
      }

      // Vérifiez que l'utilisateur n'est pas l'admin initial
      if (user.isInitialAdmin) {
        console.log('Cannot change role of the initial admin:', userId);
        return res.status(403).json({ message: "Cannot change role of the initial admin." });
      }

      // Trouver le rôle par ID
      const roleId = '6697c22180beaaa82d33906d'; // ID du rôle "moderator"
      const role = await Role.findById(roleId);
      if (!role) {
        console.log('Role not found:', roleId);
        return res.status(404).json({ message: "Role does not exist." });
      }

      // Changer le rôle de l'utilisateur
      user.roles = [roleId];
      await user.save();
      console.log('User role updated:', user);

      res.status(200).json({
        message: "FormulairePartner status updated and user role changed successfully.",
        formulairePartner: updatedFormulairePartner,
        user: user
      });
    } else {
      res.status(200).json(updatedFormulairePartner);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error });
  }
};
