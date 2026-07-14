// src/generators/adapters/docker.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class DockerAdapter implements Adapter {
  public name = 'DockerAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server, backend, database } = ast;

    // 1. Crear contenido del archivo .env que se escribirá en /dist
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

    // 2. Configurar servicio de Backend usando env_file
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

    // 3. Configurar servicio del Servidor Web
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

    // 4. Configurar Base de Datos con envVars
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

    return [
      {
        relativePath: '.env',
        content: envContent,
      },
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