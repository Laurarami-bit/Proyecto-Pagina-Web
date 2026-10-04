const fs = require('fs');
const path = require('path');

// Leemos los productos desde el archivo JSON en la carpeta data
const productsFilePath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

exports.mostrarHome = (req, res) => {
    res.render('shop/home');
};

exports.mostrarCarrito = (req, res) => {
    res.render('shop/carrito');
};

exports.mostrarDetalleProducto = (req, res) => {
    res.render('shop/detalleproducto');
};

exports.mostrarContacto = (req, res) => {
    res.render('shop/contacto');
};

exports.mostrarNosotros = (req, res) => {
    res.render('shop/nosotros');
};

// Función para filtrar y mostrar los productos solo cuando se seleccione un género
exports.verCategoria = (req, res) => {
    const categoriaBuscada = req.params.nombre.toLowerCase().trim();
    const generoBuscado = req.query.genero ? req.query.genero.toLowerCase().trim() : null;
    
    // Si no hay un género seleccionado en la URL, la lista empieza vacía
    let productosFiltrados = [];

    if (generoBuscado) {
        productosFiltrados = products.filter(p => {
            const coincideCategoria = p.category && p.category.toLowerCase().trim() === categoriaBuscada;
            const coincideGenero = p.gender && p.gender.toLowerCase().trim() === generoBuscado;
            return coincideCategoria && coincideGenero;
        });
    }

    res.render('products/list', { 
        productos: productosFiltrados, 
        categoria: req.params.nombre,
        generoActual: generoBuscado 
    });
};