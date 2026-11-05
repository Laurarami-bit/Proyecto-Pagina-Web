const { Product, Category, Color, Gender } = require('../database/models');

function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
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

async function obtenerProductos() {
    const productosDB = await Product.findAll({
        include: [Category, Color, Gender]
    });

    return productosDB.map(normalizarProducto);
}

// Página principal
exports.mostrarHome = async (req, res) => {
    try {
        const productos = await obtenerProductos();

        res.render('shop/home', { productos });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar los productos.');
    }
};

// Carrito
exports.mostrarCarrito = (req, res) => {
    res.render('shop/carrito');
};

// Detalle del producto
exports.mostrarDetalleProducto = async (req, res) => {
    try {
        const productoDB = await Product.findByPk(req.params.id, {
            include: [Category, Color, Gender]
        });

        if (!productoDB) {
            return res.status(404).send('Producto no encontrado.');
        }

        const producto = normalizarProducto(productoDB);

        res.render('products/detail', { producto });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el producto.');
    }
};

// Contacto
exports.mostrarContacto = (req, res) => {
    res.render('shop/contacto');
};

// Nosotros
exports.mostrarNosotros = (req, res) => {
    res.render('shop/nosotros');
};

// Categorías
exports.verCategoria = async (req, res) => {
    try {
        const productos = await obtenerProductos();

        const categoriaBuscada = normalizar(req.params.nombre);

        const generoBuscado = req.query.genero
            ? normalizar(req.query.genero)
            : '';

        let productosFiltrados = productos.filter(producto => {
            const coincideCategoria =
                normalizar(producto.category) === categoriaBuscada;

            const coincideGenero = generoBuscado
                ? normalizar(producto.gender) === generoBuscado
                : true;

            return coincideCategoria && coincideGenero;
        });

        res.render('products/list', {
            productos: productosFiltrados,
            categoria: req.params.nombre,
            generoActual: generoBuscado
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar la categoría.');
    }
};