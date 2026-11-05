
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const users = require('../controllers/user_controller');
const guestMiddleware = require('../middlewares/guestMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const uploadPath = path.join(__dirname, '..', 'public', 'images', 'users');

fs.mkdirSync(uploadPath, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => cb(
            null,
            Date.now() + '-' +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname).toLowerCase()
        )
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
        file.mimetype.startsWith('image/')
            ? cb(null, true)
            : cb(new Error('Solo se permiten imágenes.'))
});

router.get('/login', guestMiddleware, users.mostrarLogin);
router.get(['/register', '/registro'], guestMiddleware, users.mostrarRegistro);

router.post('/usuarios/login', guestMiddleware, users.procesarLogin);
router.post('/usuarios/registro', guestMiddleware, upload.single('avatar'), users.procesarRegistro);

router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send('Error al cerrar sesión.');
        }

        res.redirect('/login');
    });
});

router.get('/usuarios', authMiddleware, users.listarUsuarios);
router.get('/usuarios/:id/detalle', authMiddleware, users.mostrarDetalle);
router.get('/usuarios/:id/editar', authMiddleware, users.mostrarFormularioEditar);
router.post('/usuarios/:id/editar', authMiddleware, upload.single('avatar'), users.actualizarUsuario);

module.exports = router;

