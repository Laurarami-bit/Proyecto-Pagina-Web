const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { Product, Category, Color, Gender } = require('../database/models');

// Comprueba que el valor enviado exista en la tabla secundaria
const existeEn = (Modelo, mensaje) => async (valor) => {
    const fila = await Modelo.findOne({ where: { name: valor } });
    if (!fila) throw new Error(mensaje);
    return true;
};

const reglas = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio.').bail()
        .isLength({ min: 5 }).withMessage('El nombre debe tener al menos 5 caracteres.').bail()
        .isLength({ max: 150 }).withMessage('El nombre no puede superar los 150 caracteres.'),

    body('description')
        .trim()
        .notEmpty().withMessage('La descripción es obligatoria.').bail()
        .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres.'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio.').bail()
        .isFloat({ gt: 0, max: 99999999.99 }).withMessage('El precio debe ser un número mayor que cero.'),

    body('category')
        .notEmpty().withMessage('Elige una categoría.').bail()
        .custom(existeEn(Category, 'La categoría elegida no existe.')),

    body('gender')
        .notEmpty().withMessage('Elige una opción.').bail()
        .custom(existeEn(Gender, 'La opción elegida no existe.')),

    body('color')
        .notEmpty().withMessage('Elige un color.').bail()
        .custom(existeEn(Color, 'El color elegido no existe.')),

    // El archivo lo procesa multer; aquí solo mostramos su error si hubo
    body('image')
        .custom((valor, { req }) => {
            if (req.fileError) throw new Error(req.fileError);
            // Al crear (POST) la imagen es obligatoria; al editar (PUT) es opcional
            if (req.method === 'POST' && !req.file) {
                throw new Error('Debes seleccionar una imagen para el producto.');
            }
            return true;
        })
];

const manejarErrores = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        // Si la validación falla, multer ya guardó la imagen: la borramos
        if (req.file) fs.unlink(req.file.path, () => {});

        const esEdicion = Boolean(req.params.id);
        let imagenActual = '';

        if (esEdicion) {
            const existente = await Product.findByPk(req.params.id);
            if (!existente) return res.status(404).send('Producto no encontrado.');
            imagenActual = existente.image || '';
        }

        const [categories, colors, genders] = await Promise.all([
            Category.findAll(),
            Color.findAll(),
            Gender.findAll()
        ]);

        return res.status(400).render('admin/product-form', {
            title: esEdicion ? 'Editar producto' : 'Nuevo producto',
            product: { ...req.body, id: req.params.id, image: imagenActual },
            categories: categories.map(c => c.name),
            colors: colors.map(c => c.name),
            genders: genders.map(g => g.name),
            action: esEdicion ? '/products/' + req.params.id + '?_method=PUT' : '/products',
            errors: errors.mapped()
        });
    } catch (error) {
        next(error);
    }
};

module.exports = [...reglas, manejarErrores];