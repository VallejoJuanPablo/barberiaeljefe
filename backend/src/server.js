require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const membresiasRoutes = require('./routes/membresias');
const beneficiosRoutes = require('./routes/beneficios');
const marcasRoutes = require('./routes/marcas');
const publicoRoutes = require('./routes/publico');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3200;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/publico', publicoRoutes);

// Rutas protegidas
app.use('/api/clientes', authMiddleware, clientesRoutes);
app.use('/api/membresias', authMiddleware, membresiasRoutes);
app.use('/api/beneficios', authMiddleware, beneficiosRoutes);
app.use('/api/marcas', authMiddleware, marcasRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ mensaje: 'Barbería El Jefe API funcionando', version: '1.0.0' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
