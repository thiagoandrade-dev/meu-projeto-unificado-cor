const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do storage para multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'imoveis', // Pasta no Cloudinary onde as imagens serão armazenadas
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        format: 'webp'
      }
    ]
  },
});

// Configuração do multer com Cloudinary
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload,
  storage
};