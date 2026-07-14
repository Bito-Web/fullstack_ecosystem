// Generado automáticamente por Mystack CLI
const express = require('express');
const app = express();

app.use(express.json());

// Variables de entorno inyectadas
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.API_KEY = process.env.API_KEY || '';

// Rutas declaradas en el manifiesto

app.get('/api/v1/users', (req, res) => {
  // Handler auto-generado para: backend.getUsers
  res.json({ message: 'Respuesta de GET /api/v1/users', target: 'backend.getUsers' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Express corriendo en http://localhost:${PORT}`);
});