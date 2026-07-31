import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class NginxAdapter implements Adapter {
  public name = 'NginxAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server } = ast;
    const engineLower = (server.engine || '').toLowerCase();
    if (!engineLower.includes('nginx')) {
      return [];
    }

    const customHeaders = Object.entries(server.headers || {})
      .map(([key, value]) => `        add_header ${key} "${value}";`)
      .join('\n');

    const nginxConfig = `
# Generado automáticamente por Fullstack_ecosystem CLI
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    upstream backend_upstream {
        server backend:3000; # Red interna de Docker
    }

    server {
        listen ${server.ports[0] || 80};
        server_name localhost;

        ${customHeaders}

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html /home.html =404;
        }

        # Proxy dinámico para todas las rutas de la API
        location /api/v1/ {
            proxy_pass http://backend_upstream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
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