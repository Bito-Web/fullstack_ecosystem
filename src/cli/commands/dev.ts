// src/cli/commands/dev.ts
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { execSync } from 'child_process';
import readline from 'readline';
import { ZodIssue } from 'zod';
import { FullstackManifestSchema } from '../../core/schema/stack.schema';
import { ASTBuilder } from '../../core/ast/ast-builder';
import { GeneratorEngine } from '../../generators/generator-engine';

// 1. Verificar si Docker está instalado
function isDockerInstalled(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 2. Auxiliar para preguntas en consola
function askConfirmation(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 's' || normalized === 'y' || normalized === 'si');
    })
  );
}

// 3. Auto-instalador multi-plataforma
async function installDockerAuto(): Promise<boolean> {
  const platform = process.platform;
  console.log(`\n📦 Detectado sistema operativo: ${platform}`);

  try {
    if (platform === 'win32') {
      console.log('⏳ Intentando instalar Docker Desktop vía Winget en Windows...');
      execSync('winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements', {
        stdio: 'inherit',
      });
    } else if (platform === 'darwin') {
      console.log('⏳ Intentando instalar Docker Desktop vía Homebrew en macOS...');
      execSync('brew install --cask docker', { stdio: 'inherit' });
    } else if (platform === 'linux') {
      console.log('⏳ Intentando instalar Docker vía script oficial get-docker.sh en Linux...');
      execSync('curl -fsSL https://get.docker.com | sh', { stdio: 'inherit' });
    } else {
      console.warn(`⚠️ Plataforma no soportada para auto-instalación: ${platform}`);
      return false;
    }

    console.log('✅ Instalación finalizada. Recuerda reiniciar tu consola/sistema para actualizar la variable PATH.');
    return true;
  } catch (err) {
    console.error('❌ No se pudo completar la instalación automática de Docker:', err);
    return false;
  }
}

export async function devCommand(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const projectRoot = path.dirname(absolutePath);
  const outputDir = path.resolve(process.cwd(), 'dist');
  const engine = new GeneratorEngine();

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo manifiesto en "${absolutePath}"`);
    process.exit(1);
  }

  // Comprobar e instalar Docker si el usuario da su consentimiento
  let dockerReady = isDockerInstalled();

  if (!dockerReady) {
    console.log('\n⚠️ Docker no se encuentra en tu sistema.');
    const shouldInstall = await askConfirmation('¿Deseas intentar instalar Docker automáticamente ahora? (s/n) [n]: ');

    if (shouldInstall) {
      await installDockerAuto();
      dockerReady = isDockerInstalled();
    } else {
      console.log('ℹ️ Se omitirá la sincronización de contenedores Docker.');
    }
  }

  const syncDockerContainers = () => {
    if (!dockerReady && !isDockerInstalled()) {
      return;
    }

    try {
      console.log('🐋 Actualizando infraestructura Docker...');
      execSync('docker compose up -d --build', {
        cwd: outputDir,
        stdio: 'inherit',
      });
      console.log('✅ Contenedores activos y sincronizados.');
    } catch {
      console.warn('⚠️ Nota: No se pudo ejecutar Docker Compose. Asegúrate de que el daemon de Docker Desktop esté corriendo.');
    }
  };

  const rebuild = () => {
    console.clear();
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Cambio detectado en ${path.basename(filePath)}. Recompilando...`);

    try {
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      const rawData = yaml.parse(fileContent);

      const result = FullstackManifestSchema.safeParse(rawData);
      if (!result.success) {
        console.error('\n❌ Error de validación en el manifiesto:');
        result.error.issues.forEach((issue: ZodIssue) => {
          console.error(`  - [${issue.path.join('.')}]: ${issue.message}`);
        });
        console.log('\n👀 Esperando correcciones en el archivo...');
        return;
      }

      const ast = ASTBuilder.build(result.data, projectRoot);
      engine.run(ast, outputDir);
      syncDockerContainers();

      console.log('\n⚡ Entorno de desarrollo actualizado en /dist.');
      console.log('👀 Escuchando cambios en tiempo real... (Presiona Ctrl+C para salir)\n');
    } catch (err) {
      console.error('\n❌ Error durante el proceso de re-compilación:', err);
      console.log('👀 Esperando cambios para reintentar...');
    }
  };

  rebuild();

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