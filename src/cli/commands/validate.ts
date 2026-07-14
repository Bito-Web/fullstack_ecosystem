import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { FullstackManifestSchema } from '../../core/schema/stack.schema';

export function validateCommand(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo en "${absolutePath}"`);
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const rawData = yaml.parse(fileContent);

    const result = FullstackManifestSchema.safeParse(rawData);

    if (!result.success) {
      console.error('❌ Error de validación en el manifiesto:');
      result.error.issues.forEach((issue) => {
        console.error(`  - [${issue.path.join('.')}]: ${issue.message}`);
      });
      process.exit(1);
    }

    console.log('✅ ¡El manifiesto es válido!');
  } catch (err) {
    console.error('❌ Error al parsear el archivo YAML:', err);
    process.exit(1);
  }
}