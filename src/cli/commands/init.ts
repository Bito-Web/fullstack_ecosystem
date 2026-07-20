// src/cli/commands/init.ts
import fs from 'fs';
import path from 'path';
import readline from 'readline';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

export async function initCommand() {
  console.log('🚀 --- Inicializador Interactivo de Fullstack_ecosystem ---');
  console.log('Responde las siguientes preguntas para generar tu manifiesto app.yaml:\n');

  // 1. Preguntas interactivas con valores por defecto
  const projectNameInput = await askQuestion('📦 Nombre del proyecto (mi-app-fullstack): ');
  const projectName = projectNameInput || 'mi-app-fullstack';

  const serverInput = await askQuestion('🖥️  Servidor Web (1: nginx, 2: apache2) [1]: ');
  const serverEngine = serverInput === '2' ? 'apache2' : 'nginx';

  const backendInput = await askQuestion('⚙️  Lenguaje Backend (1: typescript, 2: javascript, 3: python) [1]: ');
  let backendLang = 'typescript';
  let framework = 'express';

  if (backendInput === '2') {
    backendLang = 'javascript';
  } else if (backendInput === '3') {
    backendLang = 'python';
    framework = 'fastapi';
  }

  const includeDbInput = await askQuestion('🗄️  ¿Incluir Base de Datos PostgreSQL? (s/n) [s]: ');
  const includeDb = includeDbInput.toLowerCase() !== 'n';

  // 2. Plantilla YAML auto-generada
  const yamlContent = `
# Manifiesto Fullstack generado automáticamente por Fullstack_ecosystem CLI
name: ${projectName}
version: 1.0.0

server:
  engine: ${serverEngine}
  version: "1.24"
  ports: [80, 443]
  headers:
    Referrer-Policy: strict-origin
    X-Frame-Options: DENY
  routes:
    get:
      - path: /
        handler: include(front/home.html)
      - path: /api/v1/users
        handler: backend.getUsers
    post:
      - path: /api/v1/users
        protected: true
        handler: backend.createUser

backend:
  language: ${backendLang}
  version: "5.0"
  framework: ${framework}
  entryPoint: src/server.ts
  envVars:
    NODE_ENV: development
    API_KEY: "\${API_KEY_SECRET}"
    AUTH_SECRET: "\${AUTH_SECRET}"

frontend:
  language: html
  srcDir: ./src/frontend
${
  includeDb
    ? `
database:
  engine: postgresql
  version: "16.0"
  port: 5432
  schemas:
    - ./database/init.sql
`
    : ''
}
`.trim();

  // 3. Escribir el archivo en el directorio actual o en examples/
  const targetPath = path.resolve(process.cwd(), 'app.yaml');

  if (fs.existsSync(targetPath)) {
    const overwrite = await askQuestion('⚠️  El archivo app.yaml ya existe. ¿Deseas sobrescribirlo? (s/n) [n]: ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('❌ Operación cancelada.');
      return;
    }
  }

  fs.writeFileSync(targetPath, yamlContent, 'utf8');

  console.log(`\n✨ ¡Manifiesto app.yaml generado con éxito en: ${targetPath}`);
  console.log('\n📌 Siguientes pasos recomendados:');
  console.log('  1. Revisa o personaliza el archivo app.yaml recién creado.');
  console.log('  2. Ejecuta "npm run validate" para comprobar la sintaxis.');
  console.log('  3. Ejecuta "npm run dev" para iniciar el entorno en tiempo real.\n');
}