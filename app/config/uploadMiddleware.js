const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage avec Multer et Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Dossier où les fichiers seront stockés dans Cloudinary
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'], // Formats de fichiers autorisés
    format: async (req, file) => 'png', // Format du fichier (peut être dynamique si nécessaire)
    public_id: (req, file) => file.fieldname + '-' + Date.now() // Nom public du fichier dans Cloudinary
  }
});

// Configuration de l'upload avec Multer et Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Limite de taille des fichiers (ici 10 Mo)
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/; // Types de fichiers acceptés
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Vérifier l'extension du fichier
    const mimetype = filetypes.test(file.mimetype); // Vérifier le type MIME du fichier
    if (extname && mimetype) {
      cb(null, true); // Accepter le fichier
    } else {
      cb(new Error('Seuls les fichiers images sont autorisés!'), false); // Rejeter le fichier
    }
  }
});

module.exports = upload;
