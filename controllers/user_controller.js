const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

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
    const { email, password } = req.body;
    const users = readUsers();
    const encontrado = users.find(u => u.email === email);

    if (!encontrado) {
         return res.redirect('/login');
    }

    const correcta = await bcrypt.compare(password, encontrado.password);

    if (correcta) {
        req.session.user = {
            id: encontrado.id,
            firstName: encontrado.firstName,
            lastName: encontrado.lastName,
            email: encontrado.email,
            category: encontrado.category,
            avatar: encontrado.avatar
        };
           if (req.body.recordarme) {
            res.cookie('recordarme', encontrado.email, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            });
        }
        
        return res.redirect('/perfil');
    }
    
    
     res.redirect('/login');
};

exports.mostrarRegistro = (req, res) => {
    res.render('users/registro');
};

exports.procesarRegistro = async (req, res) => {
    const { firstName, lastName, email, password, contrasenacon, category } = req.body;
    console.log('Datos de registro recibidos:', req.body);
    if (password !== contrasenacon) {
        return res.send('Las contraseñas no coinciden');
    }

    const users = readUsers();

    const nuevoUsuario = {
        id: randomUUID(),
        firstName,
        lastName,
        email,
        category,
        password: await bcrypt.hash(password, 10),
        avatar: req.file ? req.file.filename : 'default.png',
    };
    

    users.push(nuevoUsuario);
    writeUsers(users);

    res.redirect('/login');

}
exports.mostrarPerfil = (req, res) => {
    res.render('users/perfil');
};