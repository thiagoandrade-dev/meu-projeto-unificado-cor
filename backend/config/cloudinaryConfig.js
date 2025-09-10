const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();

// Configuração do multer
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

// Função para fazer upload para o Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'imoveis',
      resource_type: 'auto',
      format: 'webp',
      quality: 'auto:good',
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit'
        }
      ],
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

module.exports = {
  cloudinary,
  upload,
  storage,
  uploadToCloudinary
};