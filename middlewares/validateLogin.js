const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../database/models');

const reglas = [
    body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio.').bail()
        .isEmail().withMessage('Escribe un correo electrónico válido.').bail()
        .custom(async (valor, { req }) => {
            const usuario = await User.findOne({ where: { email: valor } });
            if (!usuario) throw new Error('Este correo no está registrado.');
            req.usuarioLogin = usuario;
            return true;
        }),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.').bail()
        .custom(async (valor, { req }) => {
            // Si el correo no existe, ese error ya se muestra arriba
            if (!req.usuarioLogin) return true;

            const coincide = await bcrypt.compare(valor, req.usuarioLogin.password);
            if (!coincide) throw new Error('La contraseña es incorrecta.');
            return true;
        })
];

const manejarErrores = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) return next();

    return res.status(400).render('users/login', {
        errors: errors.mapped(),
        old: { email: req.body.email || '' } // nunca devolvemos la contraseña
    });
};

module.exports = [...reglas, manejarErrores];