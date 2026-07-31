import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class ScriptsAdapter implements Adapter {
  public name = 'ScriptsAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const projectNameNormalized = ast.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // 1. package.json raíz en /dist
    const rootPackageJson = JSON.stringify(
      {
        name: projectNameNormalized,
        private: true,
        version: ast.version || '1.0.0',
        scripts: {
          "build:frontend": "cd frontend && npm run build",
          "package:client": "npm run build:frontend && node scripts/package-client.mjs"
        },
        devDependencies: {
          "fs-extra": "^11.4.0"
        }
      },
      null,
      2
    );

    // 2. .gitignore raíz en /dist
    const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
release-client
*.local
*.env

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

    // 3. scripts/package-client.mjs
    const packageClientMjs = `// scripts/package-client.mjs
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'release-client');

async function buildPackage() {
  console.log('🚀 Iniciando proceso de empaquetado para el cliente...');

  await fs.remove(OUTPUT_DIR);
  await fs.ensureDir(OUTPUT_DIR);

  console.log('📦 Copiando frontend compilado...');
  if (await fs.pathExists(path.join(ROOT_DIR, 'frontend'))) {
    await fs.copy(path.join(ROOT_DIR, 'frontend'), path.join(OUTPUT_DIR, 'frontend'));
  }

  console.log('📂 Copiando servidor...');
  if (await fs.pathExists(path.join(ROOT_DIR, 'server'))) {
    await fs.copy(path.join(ROOT_DIR, 'server'), path.join(OUTPUT_DIR, 'server'));
  }

  const certsDir = path.join(OUTPUT_DIR, 'server', 'certs');
  await fs.ensureDir(certsDir);

  const opensslCmd = \`openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \\
    -keyout "\${path.join(certsDir, 'privkey.pem')}" \\
    -out "\${path.join(certsDir, 'fullchain.pem')}" \\
    -subj "/CN=localhost" \\
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"\`;

  try {
    execSync(opensslCmd, { stdio: 'inherit' });
    console.log('✅ Certificado autofirmado generado en server/certs/');
  } catch (err) {
    console.warn('⚠️ No se pudo ejecutar OpenSSL automáticamente.');
  }

  console.log('⚙️ Copiando backend...');
  if (await fs.pathExists(path.join(ROOT_DIR, 'backend'))) {
    await fs.copy(path.join(ROOT_DIR, 'backend'), path.join(OUTPUT_DIR, 'backend'), {
      filter: (src) => !src.includes('node_modules')
    });
  }

  console.log('🗄️ Copiando base de datos...');
  if (await fs.pathExists(path.join(ROOT_DIR, 'database'))) {
    await fs.copy(path.join(ROOT_DIR, 'database'), path.join(OUTPUT_DIR, 'database'));
  }

  console.log('📄 Copiando Docker Compose y .env...');
  if (await fs.pathExists(path.join(ROOT_DIR, 'docker-compose.yml'))) {
    await fs.copyFile(path.join(ROOT_DIR, 'docker-compose.yml'), path.join(OUTPUT_DIR, 'docker-compose.yml'));
  }

  let envContent = '';
  if (await fs.pathExists(path.join(ROOT_DIR, '.env'))) {
    envContent = await fs.readFile(path.join(ROOT_DIR, '.env'), 'utf-8');
  }

  if (!envContent.includes('DOMAIN_NAME')) {
    envContent += '\\nDOMAIN_NAME=localhost\\nADMIN_EMAIL=admin@localhost.local\\n';
  }

  await fs.writeFile(path.join(OUTPUT_DIR, '.env'), envContent);

  console.log('\\n🎉 ¡Empaquetado exitoso en /release-client!');
}

buildPackage().catch((err) => {
  console.error('❌ Error empaquetando:', err);
  process.exit(1);
});
`;

    // 4. scripts/init-ssl.sh
    const initSslSh = `#!/bin/bash

if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo "Error: No se encontró el archivo .env"
  exit 1
fi

DOMAIN=$DOMAIN_NAME
EMAIL=$ADMIN_EMAIL
PATH_CERTS="./certbot_certs/live/$DOMAIN"

echo "=== Preparando entorno SSL para $DOMAIN ==="

if [ ! -f "$PATH_CERTS/fullchain.pem" ]; then
  echo "--> Creando certificados temporales para iniciar Apache..."
  mkdir -p "$PATH_CERTS"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \\
    -keyout "$PATH_CERTS/privkey.pem" \\
    -out "$PATH_CERTS/fullchain.pem" \\
    -subj "/CN=localhost"
fi

echo "--> Levantando contenedores..."
docker compose up -d web backend database

echo "--> Solicitando certificado real a Let's Encrypt..."
docker compose run --rm certbot certonly --webroot \\
  --webroot-path=/var/www/certbot \\
  -d $DOMAIN \\
  --email $EMAIL \\
  --agree-tos \\
  --no-eff-email \\
  --force-renewal

echo "--> Recargando Apache..."
docker compose exec web httpd -k restart

docker compose up -d certbot

echo "=== ¡SSL Configurado con éxito para https://$DOMAIN! ==="
`;

    return [
      {
        relativePath: 'package.json',
        content: rootPackageJson,
      },
      {
        relativePath: '.gitignore',
        content: gitignoreContent,
      },
      {
        relativePath: 'scripts/package-client.mjs',
        content: packageClientMjs,
      },
      {
        relativePath: 'scripts/init-ssl.sh',
        content: initSslSh,
      },
    ];
  }
}