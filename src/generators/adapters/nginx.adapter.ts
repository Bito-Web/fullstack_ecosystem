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
      
      // 1. Unificamos todas las rutas en una sola lista
      const allRoutes = [
        ...server.routes.GET,
        ...server.routes.POST,
        ...(server.routes.PUT || []),
        ...(server.routes.DELETE || [])
      ];

      // 2. Filtramos para quedarnos solo con paths únicos usando un mapa
      const uniqueRoutesMap = new Map<string, typeof allRoutes[number]>();
      allRoutes.forEach(route => {
        // Si ya existe, priorizamos el tipo 'include' si lo hubiera, o simplemente mantenemos la ruta
        if (!uniqueRoutesMap.has(route.path)) {
          uniqueRoutesMap.set(route.path, route);
        }
      });

      // 3. Generamos un único bloque 'location' por cada path
      uniqueRoutesMap.forEach((route, path) => {
        if (route.type === 'include') {
          locations.push(`     location = ${path} {
            root /usr/share/nginx/html;
            try_files /${route.target} =404;
        }`);
        } else {
          locations.push(`     location = ${path} {
            proxy_pass http://backend_upstream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }`);
        }
      });

      return locations.join('\n');
    };

    // Plantilla del nginx.conf
    const nginxConfig = `
# Generado automáticamente por Fullstack_ecosystem CLI
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