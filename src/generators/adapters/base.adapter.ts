// src/generators/adapters/base.adapter.ts
import { UnifiedAST } from '../../core/ast/ast-builder';

export interface GeneratedFile {
  relativePath: string; // Ej: "server/nginx.conf"
  content: string;      // Contenido del archivo en texto plano
}

export interface Adapter {
  name: string;
  generate(ast: UnifiedAST): GeneratedFile[];
}