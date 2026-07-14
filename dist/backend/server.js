// Generado automáticamente por Mystack CLI
const express = require('express');
const app = express();

app.use(express.json());

// Inyección de Variables de Entorno por defecto
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'super-secret-token';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.API_KEY = process.env.API_KEY || '';
process.env.AUTH_SECRET = process.env.AUTH_SECRET || '';

// Middleware de Autenticación auto-generado por Mystack CLI
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Acceso no autorizado: Se requiere la cabecera "Authorization"' 
    });
  }

  // Ejemplo básico: Bearer token validation
  const token = authHeader.split(' ')[1];
  if (!token || token !== process.env.AUTH_SECRET) {
    return res.status(403).json({ 
      error: 'Acceso prohibido: Token inválido o expirado' 
    });
  }

  next();
};

// Rutas mapeadas desde el manifiesto

// Ruta 🔓 [PÚBLICA]: GET /api/v1/users
app.get('/api/v1/users', (req, res) => {
  res.json({ 
    message: 'Respuesta de GET /api/v1/users', 
    target: 'backend.getUsers',
    protected: false 
  });
});

// Ruta 🔒 [PROTEGIDA]: POST /api/v1/users
app.post('/api/v1/users', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Respuesta de POST /api/v1/users', 
    target: 'backend.createUser',
    protected: true 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Express ejecutándose en http://localhost:${PORT}`);
});