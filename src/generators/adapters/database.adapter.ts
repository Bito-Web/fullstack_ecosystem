import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class DatabaseAdapter implements Adapter {
  public name = 'DatabaseAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    if (!ast.database) {
      return [];
    }

    const initSqlContent = `-- Inicialización de Base de Datos para ${ast.projectName}

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
    ('Admin User', 'admin@erp.local'),
    ('Dev User', 'dev@erp.local')
ON CONFLICT (email) DO NOTHING;
`;

    return [
      {
        relativePath: 'database/init.sql',
        content: initSqlContent,
      },
    ];
  }
}