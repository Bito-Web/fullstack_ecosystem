// src/generators/adapters/frontend.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';
import { generateHomeHtml } from '../templates/frontend.template';

export class FrontendAdapter implements Adapter {
  public name = 'FrontendAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    if (!ast.frontend) {
      return [];
    }

    const homeHtml = generateHomeHtml(ast.projectName);

    return [
      {
        relativePath: 'front/home.html',
        content: homeHtml,
      },
    ];
  }
}