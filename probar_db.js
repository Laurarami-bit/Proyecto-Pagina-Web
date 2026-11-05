
const { sequelize } = require('./database/models');

async function probarConexion() {
    try {
        await sequelize.authenticate();
        console.log('Conexion a la base de datos exitosa');
    } catch (error) {
        console.log('Error de conexion:', error.message);
    } finally {
        await sequelize.close();
    }
}

probarConexion();
