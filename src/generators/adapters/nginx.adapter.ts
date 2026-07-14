// src/generators/adapters/nginx.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class NginxAdapter implements Adapter {
  public name = 'NginxAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server, backend } = ast;

    // Convertir headers a formato Nginx
    const customHeaders = Object.entries(server.headers)
      .map(([key, value]) => `        add_header ${key} "${value}";`)
      .join('\n');

    // Mapear rutas GET y POST a bloques de Nginx
    const buildLocations = () => {
      const locations: string[] = [];

      // Procesar rutas GET
      server.routes.GET.forEach((route) => {
        if (route.type === 'include') {
          locations.push(`
    location = ${route.path} {
        root /usr/share/nginx/html;
        try_files /${route.target} =404;
    }`);
        } else {
          locations.push(`
    location = ${route.path} {
        proxy_pass http://backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }`);
        }
      });

      // Procesar rutas POST
      server.routes.POST.forEach((route) => {
        locations.push(`
    location = ${route.path} {
        proxy_pass http://backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }`);
      });

      return locations.join('\n');
    };

    // Plantilla del nginx.conf
    const nginxConfig = `
# Generado automáticamente por Mystack CLI
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    upstream backend_upstream {
        server localhost:3000; # Puerto por defecto del backend
    }

    server {
        listen ${server.ports[0] || 80};
        server_name localhost;

        # Cabeceras globales de seguridad
        ${customHeaders}

        # Rutas dinámicas y estáticas declaradas
        ${buildLocations()}
    }
}
`.trim();

    return [
      {
        relativePath: 'server/nginx.conf',
        content: nginxConfig,
      },
    ];
  }
}