// src/generators/generator-engine.ts
import fs from 'fs';
import path from 'path';
import { UnifiedAST } from '../core/ast/ast-builder';
import { Adapter } from './adapters/base.adapter';
import { NginxAdapter } from './adapters/nginx.adapter';
import { ExpressAdapter } from './adapters/express.adapter';
import { DockerAdapter } from './adapters/docker.adapter';
import { FrontendAdapter } from './adapters/frontend.adapter'; // <--- Importar

export class GeneratorEngine {
  private adapters: Adapter[] = [];

  constructor() {
    this.adapters.push(new NginxAdapter());
    this.adapters.push(new ExpressAdapter());
    this.adapters.push(new DockerAdapter());
    this.adapters.push(new FrontendAdapter()); // <--- Registrar
  }

  public run(ast: UnifiedAST, outputDir: string): void {
    console.log(`🔨 Escribiendo archivos de salida en: ${outputDir}...`);

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    this.adapters.forEach((adapter) => {
      console.log(`  └─ Ejecutando adaptador: ${adapter.name}`);
      const files = adapter.generate(ast);

      files.forEach((file) => {
        const fullPath = path.join(outputDir, file.relativePath);
        const fileDir = path.dirname(fullPath);

        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        fs.writeFileSync(fullPath, file.content, 'utf8');
        console.log(`     📄 Creado: ${file.relativePath}`);
      });
    });
  }
}