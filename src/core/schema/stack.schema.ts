import { z } from 'zod';

// ==========================================
// 1. SERVIDOR Y RUTAS (Proxy / Web Server)
// ==========================================
const RouteSchema = z.object({
  path: z.string().startsWith('/', { message: "La ruta debe empezar con '/'" }),
  handler: z.string().describe("Archivo o función destino, ej: 'include(front/index.html)' o 'api.users'"),
  protected: z.boolean().optional().default(false),
});

const ServerSchema = z.object({
  engine: z.enum(['apache2', 'nginx', 'nodejs', 'tomcat', 'blazor']),
  version: z.string(),
  ports: z.array(z.number().int().positive()).min(1, "Debes declarar al menos un puerto"),
  headers: z.record(z.string(), z.string()).optional().default({
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  }),
  routes: z.object({
    get: z.array(RouteSchema).optional().default([]),
    post: z.array(RouteSchema).optional().default([]),
    put: z.array(RouteSchema).optional().default([]),
    delete: z.array(RouteSchema).optional().default([]),
  }),
});

// ==========================================
// 2. BACKEND (Logica de negocio)
// ==========================================
const BackendSchema = z.object({
  language: z.enum([
    'javascript',
    'typescript',
    'python',
    'php',
    'java',
    'csharp',
  ]),
  version: z.string(),
  framework: z.string().optional().describe("ej: 'express', 'django', 'laravel'"),
  entryPoint: z.string().default('src/index'),
  envVars: z.record(z.string(), z.string()).optional().default({}),
});

// ==========================================
// 3. FRONTEND (Vistas y Assets)
// ==========================================
const FrontendSchema = z.object({
  language: z.enum(['html', 'jsx', 'tsx', 'vue', 'blade', 'php']),
  version: z.string().optional(),
  templateEngine: z.string().optional().describe("ej: 'blade', 'jinja', 'native'"),
  srcDir: z.string().default('./front'),
});

// ==========================================
// 4. BASE DE DATOS
// ==========================================s
const DatabaseSchema = z.object({
  engine: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb', 'sqlserver']),
  version: z.string(),
  port: z.number().int().positive().optional(),
  password: z.string().optional().describe("Puede ser un valor directo o `${DB_PASSWORD}`"),
  schemas: z.array(z.string()).optional().describe("Rutas a archivos .sql o migraciones"),
});

// ==========================================
// ESQUEMA PRINCIPAL DEL MANIFIESTO
// ==========================================
export const FullstackManifestSchema = z.object({
  name: z.string().min(1, "El proyecto requiere un nombre"),
  version: z.string().default('1.0.0'),
  server: ServerSchema,
  backend: BackendSchema,
  frontend: FrontendSchema.optional(),
  database: DatabaseSchema.optional(),
});

// Inferencia de tipos para TypeScript
export type FullstackManifest = z.infer<typeof FullstackManifestSchema>;