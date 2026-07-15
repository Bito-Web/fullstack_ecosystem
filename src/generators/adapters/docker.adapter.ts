// src/generators/adapters/docker.adapter.ts
import fs from 'fs';
import path from 'path';
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class DockerAdapter implements Adapter {
  public name = 'DockerAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server, backend, frontend, database } = ast;

    const envFileLines: string[] = [
      `# Generado automáticamente para ${ast.projectName}`,
      `PORT=3000`,
    ];

    // Inyectar variables del backend
    Object.entries(backend.envVars).forEach(([k, v]) => {
      envFileLines.push(`${k}=${v}`);
    });

    // Inyectar variables de la Base de Datos al .env ANTES de generar envContent
    if (database) {
      envFileLines.push(`DB_NAME=${ast.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
      envFileLines.push(`DB_PORT=${database.port || 5432}`);
      
      const dbEngine = database.engine.toLowerCase() === 'postgresql' ? 'postgres' : database.engine;
      if (dbEngine === 'postgres') {
        envFileLines.push(`POSTGRES_PASSWORD=postgres_secure_pass`);
        envFileLines.push(`POSTGRES_USER=postgres`);
        envFileLines.push(`POSTGRES_DB=${ast.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
      }
    }

    // Ahora sí unimos todas las líneas del .env
    const envContent = envFileLines.join('\n');

    // 1. Servicio de Backend
    const backendService = `
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env
    networks:
      - app-network`;

    // 2. Comprobar si el Frontend requiere un contenedor dinámico
    const fullFrontendPath = frontend ? path.resolve(process.cwd(), frontend.srcDir) : '';
    const hasDockerfile = frontend && fs.existsSync(path.join(fullFrontendPath, 'Dockerfile'));
    
    const requiresFrontendContainer = frontend && 
      (['jsx', 'tsx', 'vue', 'react'].includes((frontend.language || '').toLowerCase()) || hasDockerfile);

    let frontendService = '';
    if (requiresFrontendContainer) {
      frontendService = `
  frontend:
    build:
      context: ./front
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    networks:
      - app-network`;
    }

    // 3. Servidor Web (Nginx / Apache)
    const engineLower = (server.engine || '').toLowerCase();
    const isApache = engineLower.includes('apache') || engineLower.includes('httpd');

    let serverImage: string;
    let serverConfigFile: string;
    let serverDocRoot: string;

    if (isApache) {
      serverImage = `httpd:${server.version === '1.24' ? '2.4-alpine' : (server.version || '2.4-alpine')}`;
      serverConfigFile = './server/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro';
      serverDocRoot = '/usr/local/apache2/htdocs:ro';
    } else {
      serverImage = `nginx:${server.version || 'latest'}`;
      serverConfigFile = './server/nginx.conf:/etc/nginx/nginx.conf:ro';
      serverDocRoot = '/usr/share/nginx/html:ro';
    }

    const serverDependsOn = ['backend'];
    if (requiresFrontendContainer) {
      serverDependsOn.push('frontend');
    }

    const staticVolumeSource = requiresFrontendContainer ? './front' : (frontend?.srcDir || './front');

    const serverService = `
  server:
    image: ${serverImage}
    ports: ${server.ports.map((p) => `
      - "${p}:${p}"`).join('')}
    volumes:
      - ${serverConfigFile}
      - ${staticVolumeSource}:${serverDocRoot}
    depends_on: ${serverDependsOn.map((dep) => `
      - ${dep}`).join('')}
    networks:
      - app-network`;

    // 4. Base de Datos (Inyectamos environment explícito además del env_file)
    let databaseService = '';
    if (database) {
      const dbEngine = database.engine.toLowerCase() === 'postgresql' ? 'postgres' : database.engine;
      const dbNameNormalized = ast.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      databaseService = `
  database:
    image: ${dbEngine}:${database.version || 'latest'}
    ports:
      - "${database.port || 5432}:${database.port || 5432}"
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${dbNameNormalized}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_pass
    networks:
      - app-network`;
    }

    const composeContent = `
# Generado automáticamente por Mystack CLI
services:
${serverService}
${frontendService}
${backendService}
${databaseService}

networks:
  app-network:
    driver: bridge
`.trim();

    const backendDockerfile = `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`.trim();

    const files: GeneratedFile[] = [
      { relativePath: '.env', content: envContent },
      { relativePath: 'docker-compose.yml', content: composeContent },
      { relativePath: 'backend/Dockerfile', content: backendDockerfile },
    ];

    if (requiresFrontendContainer) {
      files.push({
        relativePath: 'front/Dockerfile',
        content: `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]
`.trim(),
      });
    }

    return files;
  }
}