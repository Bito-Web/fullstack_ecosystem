// src/cli/commands/build.ts
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { ZodIssue } from 'zod';
import { FullstackManifestSchema } from '../../core/schema/stack.schema';
import { ASTBuilder } from '../../core/ast/ast-builder';
import { GeneratorEngine } from '../../generators/generator-engine'; // <--- Importar

export function buildCommand(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const projectRoot = path.dirname(absolutePath);
  const outputDir = path.resolve(process.cwd(), 'dist'); // <--- Carpeta de destino

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo en "${absolutePath}"`);
    process.exit(1);
  }

  try {
    console.log(`🔍 Leyendo manifiesto desde: ${filePath}...`);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const rawData = yaml.parse(fileContent);

    // 1. Validar
    const result = FullstackManifestSchema.safeParse(rawData);
    if (!result.success) {
      console.error('❌ Error de validación en el manifiesto:');
      result.error.issues.forEach((issue: ZodIssue) => {
        console.error(`  - [${issue.path.join('.')}]: ${issue.message}`);
      });
      process.exit(1);
    }

    // 2. Construir AST
    console.log('⚡ Generando Árbol de Sintaxis Abstracta (AST)...');
    const ast = ASTBuilder.build(result.data, projectRoot);

    // 3. Generar Archivos Físicos (Fase 3)
    const engine = new GeneratorEngine();
    engine.run(ast, outputDir);

    console.log('\n✨ ¡Compilación completada con éxito en /dist!');
  } catch (err) {
    console.error('❌ Error durante el proceso de build:', err);
    process.exit(1);
  }
}