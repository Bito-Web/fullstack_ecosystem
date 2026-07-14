// src/core/ast/ast-builder.ts
import path from 'path';
import fs from 'fs';
import { FullstackManifest } from '../schema/stack.schema';

// Función auxiliar para resolver ${VAR_NAME} desde el entorno
function resolveEnvVars(value: string, projectRoot: string): string {
  if (!value) return value;
  
  // Reemplaza ${NOMBRE_VAR} por process.env.NOMBRE_VAR
  return value.replace(/\$\{([^}]+)\}/g, (_, envName) => {
    return process.env[envName] || '';
  });
}

export interface NormalizedRoute {
  path: string;
  type: 'include' | 'backend';
  target: string;
  protected: boolean;
}

export interface UnifiedAST {
  projectName: string;
  version: string;
  server: {
    engine: string;
    version: string;
    ports: number[];
    headers: Record<string, string>;
    routes: {
      GET: NormalizedRoute[];
      POST: NormalizedRoute[];
      PUT: NormalizedRoute[];
      DELETE: NormalizedRoute[];
    };
  };
  backend: {
    language: string;
    version: string;
    framework?: string;
    entryPoint: string;
    envVars: Record<string, string>;
  };
  frontend?: {
    language: string;
    srcDir: string;
  };
  database?: {
    engine: string;
    version: string;
    port?: number;
    schemas: string[];
  };
}

export class ASTBuilder {
  public static build(manifest: FullstackManifest, projectRoot: string): UnifiedAST {
    
    // Mapear envVars resolviendo expresiones ${VAR}
    const resolvedEnvVars: Record<string, string> = {};
    Object.entries(manifest.backend.envVars).forEach(([key, val]) => {
      resolvedEnvVars[key] = resolveEnvVars(val, projectRoot);
    });

    const normalizeRouteList = (routes: typeof manifest.server.routes.get = []) => {
      return routes.map((r) => {
        const isInclude = r.handler.startsWith('include(');
        const target = isInclude
          ? r.handler.replace(/^include\((.*)\)$/, '$1').trim()
          : r.handler;

        return {
          path: r.path,
          type: isInclude ? 'include' as const : 'backend' as const,
          target,
          protected: r.protected ?? false,
        };
      });
    };

    return {
      projectName: manifest.name,
      version: manifest.version,
      server: {
        engine: manifest.server.engine,
        version: manifest.server.version,
        ports: manifest.server.ports,
        headers: manifest.server.headers,
        routes: {
          GET: normalizeRouteList(manifest.server.routes.get),
          POST: normalizeRouteList(manifest.server.routes.post),
          PUT: normalizeRouteList(manifest.server.routes.put),
          DELETE: normalizeRouteList(manifest.server.routes.delete),
        },
      },
      backend: {
        language: manifest.backend.language,
        version: manifest.backend.version,
        framework: manifest.backend.framework,
        entryPoint: path.resolve(projectRoot, manifest.backend.entryPoint),
        envVars: resolvedEnvVars, // EnvVars interpoladas
      },
      ...(manifest.frontend && {
        frontend: {
          language: manifest.frontend.language,
          srcDir: path.resolve(projectRoot, manifest.frontend.srcDir),
        },
      }),
      ...(manifest.database && {
        database: {
          engine: manifest.database.engine,
          version: manifest.database.version,
          port: manifest.database.port,
          schemas: (manifest.database.schemas || []).map((s) => path.resolve(projectRoot, s)),
        },
      }),
    };
  }
}