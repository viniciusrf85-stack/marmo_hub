const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretórios se não existirem
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/materiais',
    './uploads/empresas',
    './uploads/usuarios'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';
    
    if (req.baseUrl.includes('/materiais')) {
      uploadPath += 'materiais/';
    } else if (req.baseUrl.includes('/empresas')) {
      uploadPath += 'empresas/';
    } else if (req.baseUrl.includes('/usuarios')) {
      uploadPath += 'usuarios/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB padrão
  },
  fileFilter: fileFilter
});

module.exports = upload;



