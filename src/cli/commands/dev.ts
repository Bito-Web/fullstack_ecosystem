// src/cli/commands/dev.ts
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { execSync } from 'child_process'; // <--- Importante para ejecutar comandos CLI
import { ZodIssue } from 'zod';
import { FullstackManifestSchema } from '../../core/schema/stack.schema';
import { ASTBuilder } from '../../core/ast/ast-builder';
import { GeneratorEngine } from '../../generators/generator-engine';

export function devCommand(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const projectRoot = path.dirname(absolutePath);
  const outputDir = path.resolve(process.cwd(), 'dist');
  const engine = new GeneratorEngine();

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo manifiesto en "${absolutePath}"`);
    process.exit(1);
  }

  // Función para orquestar la ejecución de Docker Compose
  const syncDockerContainers = () => {
    try {
      console.log('🐋 Actualizando infraestructura Docker...');
      
      // Ejecutamos docker compose up --build desde la carpeta /dist
      execSync('docker compose up -d --build', {
        cwd: outputDir,
        stdio: 'inherit', // Muestra la salida de Docker en la misma terminal
      });

      console.log('✅ Contenedores activos y sincronizados.');
    } catch (err) {
      console.warn('⚠️ Nota: No se pudo ejecutar Docker Compose. (Asegúrate de que Docker Desktop esté corriendo).');
    }
  };

  const rebuild = () => {
    console.clear();
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Cambio detectado en ${path.basename(filePath)}. Recompilando...`);

    try {
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      const rawData = yaml.parse(fileContent);

      // 1. Validar
      const result = FullstackManifestSchema.safeParse(rawData);
      if (!result.success) {
        console.error('\n❌ Error de validación en el manifiesto:');
        result.error.issues.forEach((issue: ZodIssue) => {
          console.error(`  - [${issue.path.join('.')}]: ${issue.message}`);
        });
        console.log('\n👀 Esperando correcciones en el archivo...');
        return;
      }

      // 2. Generar AST
      const ast = ASTBuilder.build(result.data, projectRoot);

      // 3. Generar archivos físicamente
      engine.run(ast, outputDir);

      // 4. Levantar / Refrescar contenedores de Docker
      syncDockerContainers();

      console.log('\n⚡ Entorno de desarrollo actualizado en /dist.');
      console.log('👀 Escuchando cambios en tiempo real... (Presiona Ctrl+C para salir)\n');
    } catch (err) {
      console.error('\n❌ Error durante el proceso de re-compilación:', err);
      console.log('👀 Esperando cambios para reintentar...');
    }
  };

  // Primera ejecución
  rebuild();

  // Escucha de cambios con debounce
  let fsTimeout: NodeJS.Timeout | null = null;
  fs.watch(absolutePath, (eventType) => {
    if (eventType === 'change') {
      if (fsTimeout) clearTimeout(fsTimeout);
      fsTimeout = setTimeout(() => {
        rebuild();
      }, 300);
    }
  });
}