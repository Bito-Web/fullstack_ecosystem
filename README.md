# 🚀 Fullstack Ecosystem (Mystack CLI)

> **Un único manifiesto declarativo para orquestar tu servidor web, backend, frontend y base de datos sin fricción.**

**Mystack** es un motor CLI que resuelve la fragmentación del stack de desarrollo web. En lugar de dispersar la configuración entre `nginx.conf`, scripts de backend, archivos `Dockerfile` y mapas de rutas en el cliente, Mystack utiliza **un único archivo manifiesto (`app.yaml`) como la Única Fuente de Verdad (*Single Source of Truth*)**.

---

## 🎯 ¿Por qué Mystack?

* **Cero desacople de rutas:** Declaras un endpoint una sola vez y el CLI genera el proxy en Nginx, el handler en el Backend y la regla de seguridad correspondiente.
* **Seguridad y Cabeceras por defecto:** Configura headers globales (CORS, CSP, X-Frame-Options) directamente en el manifiesto.
* **Orquestación transparente:** Genera automáticamente la infraestructura con `docker-compose.yml` y los entornos listos para producción o desarrollo.
* **Modo Interactivo (Watch Mode):** Re-compila la infraestructura en tiempo real y refresca los contenedores al editar el manifiesto.

---

## 🏗️ Esquema de Arquitectura

```text
               +----------------------------------+
               |        manifiesto.yaml           |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |        CLI Engine (mystack)      |
               +----------------------------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +-----------------+
|     Parser    | ----> | Core Runtime  | ----> | Generadores /   |
| & Validaciones|       |   (AST Map)   |       |  Adaptadores    |
|    (Zod)      |       |  (ASTBuilder) |       | (Nginx, Express)|
+---------------+       +---------------+       +-----------------+
                                                        |
                                                        v
                                        +-------------------------------+
                                        |  Carpeta /dist compilada      |
                                        |  - server/nginx.conf          |
                                        |  - backend/server.js          |
                                        |  - docker-compose.yml         |
                                        +-------------------------------+

```

---

## 📁 Estructura del Proyecto

```text
FULLSTACK_ECOSYSTEM/
├── bin/
│   └── mystack.ts            # Punto de entrada ejecutable
├── src/
│   ├── cli/
│   │   ├── commands/         # Comandos de Commander (validate, build, dev)
│   │   │   ├── validate.ts
│   │   │   ├── build.ts
│   │   │   └── dev.ts
│   │   └── index.ts          # Registro de CLI
│   ├── core/
│   │   ├── parser/           # Carga de archivos YAML
│   │   ├── schema/           # Esquemas de validación Zod
│   │   └── ast/              # Construcción y normalización del AST
│   ├── generators/           # Motor de adaptadores y plantillas
│   │   ├── adapters/         # Adaptadores (Nginx, Express, Docker)
│   │   └── generator-engine.ts
│   └── utils/                # Utilidades de logs
├── examples/
│   └── app.yaml              # Ejemplo de manifiesto unificado
├── ROADMAP.md                # Fases del proyecto
├── package.json
└── tsconfig.json

```

---

## 📄 Ejemplo de Manifiesto (`app.yaml`)

```yaml
name: mi-app-fullstack
version: 1.0.0

server:
  engine: nginx
  version: "1.24"
  ports: [80, 443]
  headers:
    Referrer-Policy: strict-origin
    X-Frame-Options: DENY
  routes:
    get:
      - path: /
        handler: include(front/home.html)
      - path: /api/v1/users
        handler: backend.getUsers
    post:
      - path: /api/v1/users
        handler: backend.createUser
        protected: true

backend:
  language: typescript
  version: "5.0"
  framework: express
  entryPoint: src/server.ts
  envVars:
    NODE_ENV: development

frontend:
  language: html
  srcDir: ./src/frontend

database:
  engine: postgresql
  version: "16.0"
  port: 5432
  schemas:
    - ./database/init.sql

```

---

## ⚡ Comandos Disponibles

### 1. Validar Manifiesto

Valida que la sintaxis YAML y los tipos cumplan con el esquema Zod del motor:

```bash
npm run validate
# o especificando un archivo:
npx ts-node bin/mystack.ts validate ejemplos/mi-app.yaml

```

### 2. Compilar Infraestructura (`build`)

Transpila el manifiesto en un AST y escribe la estructura física de salida en la carpeta `/dist`:

```bash
npm run build

```

**Artefactos generados en `/dist`:**

* `server/nginx.conf`: Configuración completa del proxy web.
* `backend/server.js`: Servidor de Express con los endpoints mapeados.
* `backend/package.json`: Dependencias del entorno backend.
* `docker-compose.yml`: Orquestación completa del contenedor.

### 3. Modo Desarrollo (`dev`)

Inicia el watcher en tiempo real. Al guardar cambios en el `.yaml`, se re-compila la carpeta `/dist` y se sincroniza la infraestructura con Docker automáticamente:

```bash
npm run dev

```

---

## 🗺️ Estado del Roadmap

| Fase | Tarea | Estado |
| --- | --- | --- |
| **Fase 1** | Validación de Esquema (Zod) + Parser YAML | ✅ Completada |
| **Fase 2** | Árbol de Sintaxis Abstracta (ASTBuilder) | ✅ Completada |
| **Fase 3** | Adaptadores (Nginx, Express, Docker) | ✅ Completada |
| **Fase 4** | Entorno Interactivo (`mystack dev` + Watcher) | ✅ Completada |
| **Fase 5** | Manejo de secretos (`.env`) y seguridad avanzada | 🚧 En progreso |

---

## 🛠️ Instalación y Requisitos

* **Node.js**: `>= 18.0.0`
* **TypeScript**: `>= 5.0.0`
* **Docker Desktop**: (Opcional, necesario para levantar los contenedores en `mystack dev`).

```bash
# Clonar el repositorio
git clone [https://github.com/Bito-Web/fullstack_ecosystem.git](https://github.com/Bito-Web/fullstack_ecosystem.git)

# Instalar dependencias
npm install

# Probar compilación
npm run build

```

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT.
