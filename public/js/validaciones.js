document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="/usuarios/registro"]');
    if (!form) return;

    const V = Validaciones;
    const CLASE = 'error';

    const campos = {
        firstName: form.querySelector('#firstName'),
        lastName: form.querySelector('#lastName'),
        category: form.querySelector('#category'),
        email: form.querySelector('#email'),
        password: form.querySelector('#password'),
        contrasenacon: form.querySelector('#contrasenacon'),
        terminos: form.querySelector('#terminos'),
        avatar: form.querySelector('#avatar')
    };

    const reglas = {
        firstName: () => {
            const v = campos.firstName.value;
            if (V.esVacio(v)) return 'El nombre es obligatorio.';
            if (!V.longitudMinima(v, 2)) return 'El nombre debe tener al menos 2 caracteres.';
            return '';
        },
        lastName: () => {
            const v = campos.lastName.value;
            if (V.esVacio(v)) return 'El apellido es obligatorio.';
            if (!V.longitudMinima(v, 2)) return 'El apellido debe tener al menos 2 caracteres.';
            return '';
        },
        category: () => {
            return campos.category.value ? '' : 'Selecciona una categoría.';
        },
        email: () => {
            const v = campos.email.value;
            if (V.esVacio(v)) return 'El correo electrónico es obligatorio.';
            if (!V.emailValido(v)) return 'Escribe un correo electrónico válido.';
            return '';
        },
        password: () => {
            const v = campos.password.value;
            if (!v) return 'La contraseña es obligatoria.';
            if (v.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
            if (!/[a-z]/.test(v)) return 'La contraseña debe tener una minúscula.';
            if (!/[A-Z]/.test(v)) return 'La contraseña debe tener una mayúscula.';
            if (!/\d/.test(v)) return 'La contraseña debe tener un número.';
            if (!/[^A-Za-z0-9]/.test(v)) return 'La contraseña debe tener un carácter especial.';
            return '';
        },
        contrasenacon: () => {
            return campos.contrasenacon.value === campos.password.value
                ? ''
                : 'Las contraseñas no coinciden.';
        },
        terminos: () => {
            return campos.terminos.checked ? '' : 'Debes aceptar los términos y condiciones.';
        },
        avatar: () => {
            const archivo = campos.avatar.files[0];
            if (!archivo) return ''; // la imagen es opcional
            return V.extensionValida(archivo.name)
                ? ''
                : 'La imagen debe ser un archivo JPG, JPEG, PNG o GIF.';
        }
    };

    function validarCampo(nombre) {
        const mensaje = reglas[nombre]();
        return V.mostrarError(campos[nombre], mensaje, CLASE);
    }

    // Feedback inmediato: al salir de cada campo (y al cambiar selects, casilla y archivo)
    Object.keys(campos).forEach((nombre) => {
        const campo = campos[nombre];
        const evento = (campo.type === 'checkbox' || campo.type === 'file' || campo.tagName === 'SELECT')
            ? 'change'
            : 'blur';

        campo.addEventListener(evento, () => validarCampo(nombre));
    });

    // Si cambia la contraseña, vuelve a comprobar la confirmación
    campos.password.addEventListener('input', () => {
        if (campos.contrasenacon.value) validarCampo('contrasenacon');
    });

    // Al enviar: si hay errores, no se envía y se lleva el foco al primero
    form.addEventListener('submit', (evento) => {
        let primerError = null;

        Object.keys(campos).forEach((nombre) => {
            const esValido = validarCampo(nombre);
            if (!esValido && !primerError) primerError = campos[nombre];
        });

        if (primerError) {
            evento.preventDefault();
            primerError.focus();
        }
    });
});