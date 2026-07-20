// src/cli/index.ts
import { Command } from 'commander';
import { validateCommand } from './commands/validate';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { initCommand } from './commands/init'; // <--- Importar

export function runCLI() {
  const program = new Command();

  program
    .name('fullstack_ecosystem')
    .description('CLI Engine para orquestar ecosistemas Fullstack unificados')
    .version('0.1.0');

  // Comando init (NUEVO)
  program
    .command('init')
    .description('Genera de forma interactiva un nuevo archivo manifiesto app.yaml')
    .action(() => initCommand());

  // Comando validate
  program
    .command('validate')
    .description('Valida un archivo de manifiesto YAML')
    .argument('[file]', 'Ruta al manifiesto YAML', 'examples/app.yaml')
    .action((file) => validateCommand(file));

  // Comando build
  program
    .command('build')
    .description('Compila el manifiesto YAML y genera la estructura en /dist')
    .argument('[file]', 'Ruta al manifiesto YAML', 'examples/app.yaml')
    .action((file) => buildCommand(file));

  // Comando dev
  program
    .command('dev')
    .description('Modo desarrollo: re-compila el ecosistema en tiempo real ante cambios')
    .argument('[file]', 'Ruta al manifiesto YAML', 'examples/app.yaml')
    .action((file) => devCommand(file));

  program.parse(process.argv);
}