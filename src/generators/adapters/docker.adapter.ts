// src/generators/adapters/docker.adapter.ts
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

    Object.entries(backend.envVars).forEach(([k, v]) => {
      envFileLines.push(`${k}=${v}`);
    });

    if (database) {
      envFileLines.push(`DB_NAME=${ast.projectName}`);
      envFileLines.push(`DB_PORT=${database.port || 5432}`);
    }

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

    // 2. Comprobar si el Frontend requiere un contenedor dinámico (React, Vue, Vite, etc.)
    const requiresFrontendContainer = frontend && 
      ['jsx', 'tsx', 'vue', 'react'].includes((frontend.language || '').toLowerCase());

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
      serverImage = `httpd:${server.version || '2.4-alpine'}`;
      serverConfigFile = './server/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro';
      serverDocRoot = '/usr/local/apache2/htdocs:ro';
    } else {
      serverImage = `nginx:${server.version || 'latest'}`;
      serverConfigFile = './server/nginx.conf:/etc/nginx/nginx.conf:ro';
      serverDocRoot = '/usr/share/nginx/html:ro';
    }

    // Si el frontend es estático, lo monta Nginx/Apache. Si es contenedor, se añade depende_de
    const serverDependsOn = ['backend'];
    if (requiresFrontendContainer) {
      serverDependsOn.push('frontend');
    }

    const serverService = `
  server:
    image: ${serverImage}
    ports:
${server.ports.map((p) => `      - "${p}:${p}"`).join('\n')}
    volumes:
      - ${serverConfigFile}
      - ./front:${serverDocRoot}
    depends_on:
${serverDependsOn.map((dep) => `      - ${dep}`).join('\n')}
    networks:
      - app-network`;

    // 4. Base de Datos
    let databaseService = '';
    if (database) {
      databaseService = `
  database:
    image: ${database.engine}:${database.version || 'latest'}
    ports:
      - "${database.port || 5432}:${database.port || 5432}"
    env_file:
      - .env
    networks:
      - app-network`;
    }

    const composeContent = `
# Generado automáticamente por Mystack CLI
version: '3.8'

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

    // Si requiere contenedor de frontend, generamos su Dockerfile básico
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