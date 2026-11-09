document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="/usuarios/login"]');
    if (!form) return;

    const V = Validaciones;
    const CLASE = 'error';

    const campos = {
        email: form.querySelector('#email'),
        password: form.querySelector('#password')
    };

    const reglas = {
        email: () => {
            const v = campos.email.value;
            if (V.esVacio(v)) return 'El correo electrónico es obligatorio.';
            if (!V.emailValido(v)) return 'Escribe un correo electrónico válido.';
            return '';
        },
        password: () => {
            return campos.password.value ? '' : 'La contraseña es obligatoria.';
        }
    };

    function validarCampo(nombre) {
        const mensaje = reglas[nombre]();
        return V.mostrarError(campos[nombre], mensaje, CLASE);
    }

    // Feedback inmediato al salir de cada campo
    Object.keys(campos).forEach((nombre) => {
        campos[nombre].addEventListener('blur', () => validarCampo(nombre));
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