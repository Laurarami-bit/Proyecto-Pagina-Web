document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form.product-form');
    if (!form) return;

    const V = Validaciones;
    const CLASE = 'error-campo';

    // Si ya hay una imagen guardada (estamos editando), la imagen es opcional
    const esEdicion = Boolean(document.querySelector('.current-image'));

    const campos = {
        name: form.querySelector('#name'),
        description: form.querySelector('#description'),
        category: form.querySelector('#category'),
        gender: form.querySelector('#gender'),
        price: form.querySelector('#price'),
        color: form.querySelector('#color'),
        image: form.querySelector('#image')
    };

    const reglas = {
        name: () => {
            const v = campos.name.value;
            if (V.esVacio(v)) return 'El nombre es obligatorio.';
            if (!V.longitudMinima(v, 5)) return 'El nombre debe tener al menos 5 caracteres.';
            if (v.trim().length > 150) return 'El nombre no puede superar los 150 caracteres.';
            return '';
        },
        description: () => {
            const v = campos.description.value;
            if (V.esVacio(v)) return 'La descripción es obligatoria.';
            if (!V.longitudMinima(v, 20)) return 'La descripción debe tener al menos 20 caracteres.';
            return '';
        },
        category: () => {
            return campos.category.value ? '' : 'Elige una categoría.';
        },
        gender: () => {
            return campos.gender.value ? '' : 'Elige una opción.';
        },
        price: () => {
            const v = campos.price.value;
            if (V.esVacio(v)) return 'El precio es obligatorio.';
            if (!Number.isFinite(Number(v)) || Number(v) <= 0) {
                return 'El precio debe ser un número mayor que cero.';
            }
            return '';
        },
        color: () => {
            return campos.color.value ? '' : 'Elige un color.';
        },
        image: () => {
            const archivo = campos.image.files[0];
            if (!archivo) {
                return esEdicion ? '' : 'Debes seleccionar una imagen para el producto.';
            }
            return V.extensionValida(archivo.name)
                ? ''
                : 'La imagen debe ser un archivo JPG, JPEG, PNG o GIF.';
        }
    };

    function validarCampo(nombre) {
        const mensaje = reglas[nombre]();
        return V.mostrarError(campos[nombre], mensaje, CLASE);
    }

    // Feedback inmediato: al salir de cada campo (y al cambiar selects y archivo)
    Object.keys(campos).forEach((nombre) => {
        const campo = campos[nombre];
        const evento = (campo.type === 'file' || campo.tagName === 'SELECT')
            ? 'change'
            : 'blur';

        campo.addEventListener(evento, () => validarCampo(nombre));
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