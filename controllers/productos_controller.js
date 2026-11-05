const { Op } = require('sequelize');
const { Product, Category, Color, Gender } = require('../database/models');

async function obtenerOpciones() {
    const categories = await Category.findAll();
    const colors = await Color.findAll();
    const genders = await Gender.findAll();

    return {
        categories: categories.map(c => c.name),
        colors: colors.map(c => c.name),
        genders: genders.map(g => g.name)
    };
}

async function buscarProducto(id) {
    return await Product.findByPk(id, {
        include: [Category, Color, Gender]
    });
}

function normalizarProducto(producto) {
    const p = producto.get({ plain: true });

    return {
        ...p,
        category: p.Category ? p.Category.name : '',
        color: p.Color ? p.Color.name : '',
        gender: p.Gender ? p.Gender.name : ''
    };
}

function validarProducto({ name, description, price, category, color, gender }) {
    if (!name?.trim() || !description?.trim() || !category || !color || !gender || price === undefined || price === '') {
        return 'Completa todos los campos obligatorios.';
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        return 'El precio debe ser mayor que cero.';
    }

    return null;
}

// Listar y buscar productos
exports.listarProductos = async (req, res) => {
    try {
        const buscar = req.query.buscar || '';

        const productosDB = await Product.findAll({
            where: buscar
                ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${buscar}%` } },
                        { description: { [Op.like]: `%${buscar}%` } }
                    ]
                }
                : {},
            include: [Category, Color, Gender]
        });

        const products = productosDB.map(normalizarProducto);

        res.render('admin/products', {
            title: 'Productos',
            products,
            buscar
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al listar los productos.');
    }
};

// Mostrar formulario para crear
exports.mostrarFormularioNuevo = async (req, res) => {
    try {
        const opciones = await obtenerOpciones();

        const product = {
            name: '',
            description: '',
            category: '',
            gender: '',
            price: '',
            color: '',
            image: ''
        };

        res.render('admin/product-form', {
            title: 'Nuevo producto',
            product,
            ...opciones,
            action: '/products'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el formulario.');
    }
};

// Crear producto
exports.crearProducto = async (req, res) => {
    try {
        const { name, description, category, price, color, gender } = req.body;

        const error = validarProducto({
            name, description, category, price, color, gender
        });

        if (error) {
            return res.status(400).send(error);
        }

        if (!req.file) {
            return res.status(400).send('Debes seleccionar una imagen para el producto.');
        }

        const categoriaDB = await Category.findOne({ where: { name: category } });
        const colorDB = await Color.findOne({ where: { name: color } });
        const generoDB = await Gender.findOne({ where: { name: gender } });

        if (!categoriaDB || !colorDB || !generoDB) {
            return res.status(400).send('La categoría, el color o el género no son válidos.');
        }

        await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            image: '/uploads/' + req.file.filename,
            category_id: categoriaDB.id,
            color_id: colorDB.id,
            gender_id: generoDB.id
        });

        res.redirect('/products');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al crear el producto.');
    }
};

// Mostrar formulario para editar
exports.mostrarFormularioEditar = async (req, res) => {
    try {
        const productoDB = await buscarProducto(req.params.id);

        if (!productoDB) {
            return res.status(404).send('Producto no encontrado.');
        }

        const product = normalizarProducto(productoDB);
        const opciones = await obtenerOpciones();

        res.render('admin/product-form', {
            title: 'Editar producto',
            product,
            ...opciones,
            action: '/products/' + product.id + '?_method=PUT'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el producto.');
    }
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
    try {
        const producto = await Product.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).send('Producto no encontrado.');
        }

        const { name, description, category, price, color, gender } = req.body;

        const error = validarProducto({
            name, description, category, price, color, gender
        });

        if (error) {
            return res.status(400).send(error);
        }

        const categoriaDB = await Category.findOne({ where: { name: category } });
        const colorDB = await Color.findOne({ where: { name: color } });
        const generoDB = await Gender.findOne({ where: { name: gender } });

        if (!categoriaDB || !colorDB || !generoDB) {
            return res.status(400).send('La categoría, el color o el género no son válidos.');
        }

        const datos = {
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category_id: categoriaDB.id,
            color_id: colorDB.id,
            gender_id: generoDB.id
        };

        if (req.file) {
            datos.image = '/uploads/' + req.file.filename;
        }

        await producto.update(datos);

        res.redirect('/products');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al actualizar el producto.');
    }
};

// Eliminar producto
exports.eliminarProducto = async (req, res) => {
    try {
        const producto = await Product.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).send('Producto no encontrado.');
        }

        await producto.destroy();

        res.redirect('/products');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al eliminar el producto.');
    }
};