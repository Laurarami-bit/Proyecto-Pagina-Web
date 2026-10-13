const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

function leerProductos() {
    if (!fs.existsSync(productsFilePath)) {
        return [];
    }

    const contenido = fs.readFileSync(productsFilePath, 'utf-8');
    const productos = JSON.parse(contenido);

    if (!Array.isArray(productos)) {
        throw new Error('El archivo products.json no contiene una lista válida.');
    }

    return productos;
}

function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}


exports.mostrarHome = (req, res) => {
    const productos = leerProductos();
    res.render('shop/home', { productos });
};


exports.mostrarCarrito = (req, res) => {
    res.render('shop/carrito');
};

exports.mostrarDetalleProducto = (req, res) => {
    const productos = leerProductos();

    const producto = productos.find(
        p => String(p.id) === String(req.params.id)
    );

    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }

    // Apunta correctamente a la ruta de tu vista en views/products/detail.ejs
    res.render('products/detail', { producto });
};

exports.mostrarContacto = (req, res) => {
    res.render('shop/contacto');
};

exports.mostrarNosotros = (req, res) => {
    res.render('shop/nosotros');
};

exports.verCategoria = (req, res) => {
    const productos = leerProductos();

    const categoriaBuscada = normalizar(req.params.nombre);
    const generoBuscado = req.query.genero
        ? normalizar(req.query.genero)
        : '';

    let productosFiltrados = [];

    if (generoBuscado) {
        productosFiltrados = productos.filter(producto => {
            const coincideCategoria =
                normalizar(producto.category) === categoriaBuscada;

            const coincideGenero =
                normalizar(producto.gender) === generoBuscado;

            return coincideCategoria && coincideGenero;
        });
    }

    res.render('products/list', {
        productos: productosFiltrados,
        categoria: req.params.nombre,
        generoActual: generoBuscado
    });
};