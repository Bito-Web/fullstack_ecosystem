// src/generators/adapters/express.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class ExpressAdapter implements Adapter {
  public name = 'ExpressAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { backend, server } = ast;

    // Solo aplica para proyectos que utilicen Node.js (JavaScript / TypeScript)
    if (backend.language !== 'javascript' && backend.language !== 'typescript') {
      return [];
    }

    // 1. Plantilla para el Middleware de Autenticación
    const authMiddlewareCode = `
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
`.trim();

    // 2. Mapeo de handlers inyectando el middleware en rutas protegidas
    const buildRouteHandlers = () => {
      const handlers: string[] = [];

      // Procesar rutas GET
      server.routes.GET.filter((r) => r.type === 'backend').forEach((route) => {
        const middleware = route.protected ? 'authMiddleware, ' : '';
        const protectionNotice = route.protected ? '🔒 [PROTEGIDA]' : '🔓 [PÚBLICA]';

        handlers.push(`
// Ruta ${protectionNotice}: GET ${route.path}
app.get('${route.path}', ${middleware}(req, res) => {
  res.json({ 
    message: 'Respuesta de GET ${route.path}', 
    target: '${route.target}',
    protected: ${route.protected} 
  });
});`);
      });

      // Procesar rutas POST
      server.routes.POST.filter((r) => r.type === 'backend').forEach((route) => {
        const middleware = route.protected ? 'authMiddleware, ' : '';
        const protectionNotice = route.protected ? '🔒 [PROTEGIDA]' : '🔓 [PÚBLICA]';

        handlers.push(`
// Ruta ${protectionNotice}: POST ${route.path}
app.post('${route.path}', ${middleware}(req, res) => {
  res.json({ 
    message: 'Respuesta de POST ${route.path}', 
    target: '${route.target}',
    protected: ${route.protected} 
  });
});`);
      });

      return handlers.join('\n');
    };

    // 3. Generar el código principal del servidor Express
    const serverJsContent = `
// Generado automáticamente por Mystack CLI
const express = require('express');
const app = express();

app.use(express.json());

// Inyección de Variables de Entorno por defecto
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'super-secret-token';
${Object.entries(backend.envVars)
  .map(([k, v]) => `process.env.${k} = process.env.${k} || '${v}';`)
  .join('\n')}

${authMiddlewareCode}

// Rutas mapeadas desde el manifiesto
${buildRouteHandlers()}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Backend Express ejecutándose en http://localhost:\${PORT}\`);
});
`.trim();

    // 4. package.json independiente
    const packageJsonContent = JSON.stringify(
      {
        name: `${ast.projectName}-backend`,
        version: ast.version,
        main: 'server.js',
        scripts: {
          start: 'node server.js',
        },
        dependencies: {
          express: '^4.19.2',
        },
      },
      null,
      2
    );

    return [
      {
        relativePath: 'backend/server.js',
        content: serverJsContent,
      },
      {
        relativePath: 'backend/package.json',
        content: packageJsonContent,
      },
    ];
  }
}