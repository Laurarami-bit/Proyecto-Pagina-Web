
const bcrypt = require('bcryptjs');
const { User, UserCategory } = require('../database/models');

exports.mostrarLogin = (req, res) => {
    res.render('users/login');
};

exports.procesarLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const encontrado = await User.findOne({ where: { email } });

        if (!encontrado) {
            return res.redirect('/login');
        }

        const correcta = await bcrypt.compare(password, encontrado.password);

        if (!correcta) {
            return res.redirect('/login');
        }

        const categoria = await UserCategory.findByPk(encontrado.user_category_id);

        req.session.cookie.maxAge = req.body.recordarme
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

        req.session.user = {
            id: encontrado.id,
            firstName: encontrado.first_name,
            lastName: encontrado.last_name,
            email: encontrado.email,
            category: categoria ? categoria.name : '',
            avatar: encontrado.avatar
        };

        res.redirect('/home');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al iniciar sesión.');
    }
};

exports.mostrarRegistro = async (req, res) => {
    try {
        const categorias = await UserCategory.findAll();
        res.render('users/registro', { categorias });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el registro.');
    }
};

exports.procesarRegistro = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            contrasenacon,
            category
        } = req.body;

        if (password !== contrasenacon) {
            return res.send('Las contraseñas no coinciden');
        }

        const existente = await User.findOne({ where: { email } });

        if (existente) {
            return res.send('Este correo ya está registrado.');
        }

        const categoria = await UserCategory.findOne({
            where: { name: category }
        });

        if (!categoria) {
            return res.status(400).send('La categoría no es válida.');
        }

        await User.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password: await bcrypt.hash(password, 10),
            avatar: req.file ? req.file.filename : 'default.png',
            user_category_id: categoria.id
        });

        res.redirect('/login');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al registrar el usuario.');
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.findAll({
            include: [UserCategory]
        });

        res.render('users/listado', { usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al consultar los usuarios.');
    }
};

exports.mostrarDetalle = async (req, res) => {
    try {
        const usuario = await User.findByPk(req.params.id, {
            include: [UserCategory]
        });

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado.');
        }

        res.render('users/detalle', { usuario });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al consultar el usuario.');
    }
};

exports.mostrarFormularioEditar = async (req, res) => {
    try {
        const usuario = await User.findByPk(req.params.id);
        const categorias = await UserCategory.findAll();

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado.');
        }

        res.render('users/editar', { usuario, categorias });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el formulario.');
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const usuario = await User.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado.');
        }

        const {
            firstName,
            lastName,
            email,
            category,
            password
        } = req.body;

        const existente = await User.findOne({
            where: { email }
        });

        if (existente && existente.id !== usuario.id) {
            return res.status(400).send('Este correo ya está registrado.');
        }

        const categoria = await UserCategory.findByPk(category);

        if (!categoria) {
            return res.status(400).send('La categoría no es válida.');
        }

        const datos = {
            first_name: firstName,
            last_name: lastName,
            email,
            user_category_id: categoria.id
        };

        if (password && password.trim() !== '') {
            datos.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            datos.avatar = req.file.filename;
        }

        await usuario.update(datos);

        res.redirect(`/usuarios/${usuario.id}/detalle`);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al actualizar el usuario.');
    }
};
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('recordarme');
        res.redirect('/login');
    });
};
