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