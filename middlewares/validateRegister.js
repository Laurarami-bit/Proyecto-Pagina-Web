const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { User, UserCategory } = require('../database/models');

const reglas = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio.').bail()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio.').bail()
        .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres.'),

    body('category')
        .notEmpty().withMessage('Selecciona una categoría.').bail()
        .custom(async (valor) => {
            const categoria = await UserCategory.findOne({ where: { name: valor } });
            if (!categoria) throw new Error('La categoría no es válida.');
        }),

    body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio.').bail()
        .isEmail().withMessage('Escribe un correo electrónico válido.').bail()
        .custom(async (valor) => {
            const existente = await User.findOne({ where: { email: valor } });
            if (existente) throw new Error('Este correo ya está registrado.');
        }),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.').bail()
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.').bail()
        // OPCIONAL del sprint: si no la quieren, borren estas 4 líneas
        .matches(/[a-z]/).withMessage('La contraseña debe tener una minúscula.').bail()
        .matches(/[A-Z]/).withMessage('La contraseña debe tener una mayúscula.').bail()
        .matches(/\d/).withMessage('La contraseña debe tener un número.').bail()
        .matches(/[^A-Za-z0-9]/).withMessage('La contraseña debe tener un carácter especial.'),

    body('contrasenacon')
        .custom((valor, { req }) => {
            if (valor !== req.body.password) throw new Error('Las contraseñas no coinciden.');
            return true;
        }),

    body('terminos')
        .equals('on').withMessage('Debes aceptar los términos y condiciones.'),

    // El archivo lo procesa multer; aquí solo mostramos su error si hubo
    body('avatar')
        .custom((valor, { req }) => {
            if (req.fileError) throw new Error(req.fileError);
            return true;
        })
];

const manejarErrores = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        // Si la validación falla, multer ya guardó la imagen: la borramos
        if (req.file) fs.unlink(req.file.path, () => {});

        const categorias = await UserCategory.findAll();
        const { password, contrasenacon, ...old } = req.body; // nunca devolvemos contraseñas

        return res.status(400).render('users/registro', {
            categorias,
            errors: errors.mapped(),
            old
        });
    } catch (error) {
        next(error);
    }
};

module.exports = [...reglas, manejarErrores];