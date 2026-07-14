// src/generators/adapters/docker.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class DockerAdapter implements Adapter {
  public name = 'DockerAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server, backend, database } = ast;

    // 1. Configurar servicio de Backend en Compose
    let backendService = `
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
${Object.entries(backend.envVars)
  .map(([k, v]) => `      - ${k}=${v}`)
  .join('\n') || '      - NODE_ENV=production'}
    networks:
      - app-network`;

    // 2. Configurar servicio de Servidor Web (Nginx/Apache)
    const serverService = `
  server:
    image: ${server.engine}:${server.version || 'latest'}
    ports:
${server.ports.map((p) => `      - "${p}:${p}"`).join('\n')}
    volumes:
      - ./server/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./front:/usr/share/nginx/html:ro
    depends_on:
      - backend
    networks:
      - app-network`;

    // 3. Configurar Servicio de Base de Datos si está declarada en el YAML
    let databaseService = '';
    if (database) {
      databaseService = `
  database:
    image: ${database.engine}:${database.version || 'latest'}
    ports:
      - "${database.port || 5432}:${database.port || 5432}"
    environment:
      - POSTGRES_DB=${ast.projectName}
      - POSTGRES_PASSWORD=secret
    networks:
      - app-network`;
    }

    // 4. Armar el docker-compose.yml final
    const composeContent = `
# Generado automáticamente por Mystack CLI
version: '3.8'

services:
${serverService}
${backendService}
${databaseService}

networks:
  app-network:
    driver: bridge
`.trim();

    // 5. Generar Dockerfile básico para el backend de Node.js
    const backendDockerfile = `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`.trim();

    return [
      {
        relativePath: 'docker-compose.yml',
        content: composeContent,
      },
      {
        relativePath: 'backend/Dockerfile',
        content: backendDockerfile,
      },
    ];
  }
}