const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const USERS_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

exports.mostrarLogin = (req, res) => {
    res.render('users/login');
};

exports.procesarLogin = async (req, res) => {
    const { usuario, clave } = req.body;
    const users = readUsers();
    const encontrado = users.find(u => u.usuario === usuario);

    if (!encontrado) {
        return res.send('Usuario o contraseña incorrectos');
    }

    const correcta = await bcrypt.compare(clave, encontrado.contrasena);

    if (correcta) {
        return res.redirect('/home');
    }

    res.send('Usuario o contraseña incorrectos');
};

exports.mostrarRegistro = (req, res) => {
    res.render('users/registro');
};

exports.procesarRegistro = async (req, res) => {
    const { nombre, usuario, correo, contrasena, contrasenacon } = req.body;

    if (contrasena !== contrasenacon) {
        return res.send('Las contraseñas no coinciden');
    }

    const users = readUsers();

    const nuevoUsuario = {
        id: randomUUID(),
        nombre,
        usuario,
        correo,
        contrasena: await bcrypt.hash(contrasena, 100)
    };

    users.push(nuevoUsuario);
    writeUsers(users);

    res.redirect('/login');
};