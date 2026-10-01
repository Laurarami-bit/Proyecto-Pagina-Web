exports.mostrarHome = (req, res) => {
    res.render('shop/home');
};

exports.mostrarCarrito = (req, res) => {
    res.render('shop/carrito');
};

exports.mostrarDetalleProducto = (req, res) => {
    res.render('shop/detalleproducto');
};