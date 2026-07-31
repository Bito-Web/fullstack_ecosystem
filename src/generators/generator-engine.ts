// src/generators/generator-engine.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { UnifiedAST } from '../core/ast/ast-builder';
import { Adapter } from './adapters/base.adapter';
import { ApacheAdapter } from './adapters/apache.adapter';
import { NginxAdapter } from './adapters/nginx.adapter';
import { ExpressAdapter } from './adapters/express.adapter';
import { DockerAdapter } from './adapters/docker.adapter';
import { FrontendAdapter } from './adapters/frontend.adapter';
import { DatabaseAdapter } from './adapters/database.adapter';
import { ScriptsAdapter } from './adapters/scripts.adapter';

export class GeneratorEngine {
  private adapters: Adapter[] = [];

  constructor() {
    this.adapters.push(new NginxAdapter());
    this.adapters.push(new ExpressAdapter());
    this.adapters.push(new ApacheAdapter());
    this.adapters.push(new DockerAdapter());
    this.adapters.push(new FrontendAdapter());
    this.adapters.push(new DatabaseAdapter());
    this.adapters.push(new ScriptsAdapter());
  }

  public run(ast: UnifiedAST, outputDir: string): void {
    console.log(`  Escribiendo archivos de salida en: ${outputDir}...`);

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // 1. Ejecutar todos los adaptadores
    this.adapters.forEach((adapter) => {
      console.log(`    Ejecutando adaptador: ${adapter.name}`);
      const files = adapter.generate(ast);
      files.forEach((file) => {
        const fullPath = path.join(outputDir, file.relativePath);
        const fileDir = path.dirname(fullPath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(fullPath, file.content, 'utf8');
        console.log(`       Creado: ${file.relativePath}`);
      });
    });

    // 2. Generar Certificados SSL por defecto en server/certs
    const certsDir = path.join(outputDir, 'server', 'certs');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    const opensslCmd = `openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout "${path.join(certsDir, 'privkey.pem')}" \
      -out "${path.join(certsDir, 'fullchain.pem')}" \
      -subj "/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`;

    try {
      execSync(opensslCmd, { stdio: 'ignore' });
      console.log(`       Creado: server/certs/ (SSL Autofirmado)`);
    } catch {
      console.warn('  [warn] No se pudo ejecutar OpenSSL dinámicamente para generar server/certs/.');
    }
  }
}