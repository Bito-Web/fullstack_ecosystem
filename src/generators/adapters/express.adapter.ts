// src/generators/adapters/express.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class ExpressAdapter implements Adapter {
  public name = 'ExpressAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { backend, server } = ast;

    // Solo se ejecuta si el backend usa JavaScript o TypeScript
    if (backend.language !== 'javascript' && backend.language !== 'typescript') {
      return [];
    }

    // 1. Mapear handlers desde el AST para las rutas de Backend
    const buildRouteHandlers = () => {
      const handlers: string[] = [];

      // Procesar rutas GET asociadas al backend
      server.routes.GET.filter((r) => r.type === 'backend').forEach((route) => {
        handlers.push(`
app.get('${route.path}', (req, res) => {
  // Handler auto-generado para: ${route.target}
  res.json({ message: 'Respuesta de GET ${route.path}', target: '${route.target}' });
});`);
      });

      // Procesar rutas POST asociadas al backend
      server.routes.POST.filter((r) => r.type === 'backend').forEach((route) => {
        handlers.push(`
app.post('${route.path}', (req, res) => {
  // Handler auto-generado para: ${route.target}
  res.json({ message: 'Respuesta de POST ${route.path}', target: '${route.target}' });
});`);
      });

      return handlers.join('\n');
    };

    // 2. Contenido del Servidor Express
    const serverJsContent = `
// Generado automáticamente por Mystack CLI
const express = require('express');
const app = express();

app.use(express.json());

// Variables de entorno inyectadas
${Object.entries(backend.envVars)
  .map(([k, v]) => `process.env.${k} = process.env.${k} || '${v}';`)
  .join('\n')}

// Rutas declaradas en el manifiesto
${buildRouteHandlers()}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Backend Express corriendo en http://localhost:\${PORT}\`);
});
`.trim();

    // 3. package.json independiente para el backend
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