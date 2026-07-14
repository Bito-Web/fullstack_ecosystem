# 🚀 Fullstack Ecosystem (Mystack CLI)

> **Un único manifiesto declarativo para orquestar tu servidor web, backend, frontend y base de datos sin fricción.**

**Mystack** es un motor CLI que resuelve la fragmentación del stack de desarrollo web. En lugar de dispersar la configuración entre `nginx.conf`, scripts de backend, archivos `Dockerfile` y mapas de rutas en el cliente, Mystack utiliza **un único archivo manifiesto (`app.yaml`) como la Única Fuente de Verdad (*Single Source of Truth*)**.

---

## 🎯 ¿Por qué Mystack?

* **Cero desacople de rutas:** Declaras un endpoint una sola vez y el CLI genera el proxy en Nginx, el handler en el Backend y la regla de seguridad correspondiente.
* **Seguridad y Cabeceras por defecto:** Configura headers globales (CORS, CSP, X-Frame-Options) y middleware de autenticación automático (`protected: true`) directamente en el manifiesto.
* **Manejo de Secretos (.env):** Inyecta variables dinámicas `${VAR_SECRET}` en tu manifiesto sin exponer contraseñas en tu repositorio Git.
* **Orquestación transparente:** Genera automáticamente la infraestructura con `docker-compose.yml`, contenedores aislados y entornos listos para producción o desarrollo.
* **Modo Interactivo (Watch Mode):** Re-compila la infraestructura en tiempo real y refresca los contenedores al editar el manifiesto.

---

## 🏗️ Esquema de Arquitectura

```text
               +----------------------------------+
               |             app.yaml             |
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
+---------------+       +---------------+       +-------------------+
|     Parser    | ----> | Core Runtime  | ----> |   Generadores /   |
| & Validaciones|       |   (AST Map)   |       |    Adaptadores    |
|    (Zod)      |       |  (ASTBuilder) |       | (Nginx, Express,  |
+---------------+       +---------------+       |  Docker, Front)   |
                                                +-------------------+
                                                          |
                                                          v
                                        +----------------------------------+
                                        |  Carpeta /dist compilada         |
                                        |  - .env                          |
                                        |  - docker-compose.yml            |
                                        |  - server/nginx.conf             |
                                        |  - backend/server.js (Auth middleware)
                                        |  - front/home.html               |
                                        +----------------------------------+

```

---

## 📁 Estructura del Proyecto

```text
FULLSTACK_ECOSYSTEM/
├── bin/
│   └── mystack.ts            # Punto de entrada ejecutable CLI
├── src/
│   ├── cli/
│   │   ├── commands/         # Comandos (init, validate, build, dev)
│   │   │   ├── init.ts
│   │   │   ├── validate.ts
│   │   │   ├── build.ts
│   │   │   └── dev.ts
│   │   └── index.ts          # Registro de comandos de Commander
│   ├── core/
│   │   ├── parser/           # Carga y lectura de archivos YAML
│   │   ├── schema/           # Esquemas de validación Zod
│   │   └── ast/              # Construcción, normalización e interpolación .env del AST
│   ├── generators/           # Motor de adaptadores y plantillas
│   │   ├── adapters/         # Adaptadores (Nginx, Express, Docker, Frontend)
│   │   │   ├── base.adapter.ts
│   │   │   ├── nginx.adapter.ts
│   │   │   ├── express.adapter.ts
│   │   │   ├── docker.adapter.ts
│   │   │   └── frontend.adapter.ts
│   │   ├── templates/        # Plantillas de UI y código base
│   │   │   └── frontend.template.ts
│   │   └── generator-engine.ts
│   └── utils/                # Utilidades de logs
├── app.yaml                  # Manifiesto principal del proyecto
├── examples/
│   └── app.yaml              # Ejemplo de manifiesto de referencia
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
        protected: true
        handler: backend.createUser

backend:
  language: typescript
  version: "5.0"
  framework: express
  entryPoint: src/server.ts
  envVars:
    NODE_ENV: development
    API_KEY: "${API_KEY_SECRET}"
    AUTH_SECRET: "${AUTH_SECRET}"

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

### 1. Inicializar Proyecto Interactivo (`init`)

Genera paso a paso mediante una encuesta interactiva en la terminal un archivo `app.yaml` inicial libre de errores sintácticos:

```bash
npm run init

```

### 2. Validar Manifiesto (`validate`)

Comprueba que la sintaxis YAML y los tipos de datos cumplan con el esquema estricto de Zod:

```bash
npm run validate
# O especificando un archivo personalizado:
npx ts-node bin/mystack.ts validate ejemplos/mi-app.yaml

```

### 3. Compilar Infraestructura (`build`)

Transpila el manifiesto en un AST, resuelve variables de entorno e inyecta middlewares para generar los artefactos en la carpeta `/dist`:

```bash
npm run build

```

**Artefactos generados en `/dist`:**

* `.env`: Variables de entorno resolviendo sintaxis `${VAR}`.
* `docker-compose.yml`: Configuración de servicios (Server, Backend, Database) en red bridge.
* `server/nginx.conf`: Configuración del servidor proxy web.
* `backend/server.js`: Servidor Express con rutas mapeadas y `authMiddleware` inyectado en endpoints protegidos.
* `backend/package.json`: Dependencias aisladas del servidor backend.
* `backend/Dockerfile`: Imagen optimizada de Node.js.
* `front/home.html`: Vista de cliente generada para consumir los endpoints.

### 4. Modo Desarrollo (`dev`)

Inicia el watcher en tiempo real. Al modificar y guardar `app.yaml`, re-compila la carpeta `/dist` y actualiza la infraestructura con Docker automáticamente:

```bash
npm run dev

```

---

## 🗺️ Estado del Roadmap

| Fase | Tarea | Estado |
| --- | --- | --- |
| **Fase 1** | Validación de Esquema (Zod) + Parser YAML | ✅ Completada |
| **Fase 2** | Árbol de Sintaxis Abstracta (ASTBuilder) | ✅ Completada |
| **Fase 3** | Adaptadores (Nginx, Express, Docker, Frontend) | ✅ Completada |
| **Fase 4** | Entorno Interactivo (`mystack dev` + Watcher) | ✅ Completada |
| **Fase 5** | Manejo de secretos (`.env`), Middlewares Auth e Init CLI | ✅ Completada |

---

## 🛠️ Instalación y Requisitos

* **Node.js**: `>= 18.0.0`
* **TypeScript**: `>= 5.0.0`
* **Docker Desktop**: (Opcional, necesario para sincronizar contenedores automáticos en `mystack dev`).

```bash
# Clonar el repositorio
git clone [https://github.com/Bito-Web/fullstack_ecosystem.git](https://github.com/Bito-Web/fullstack_ecosystem.git)

# Entrar al proyecto
cd fullstack_ecosystem

# Instalar dependencias
npm install

# Inicializar o probar compilación
npm run init
npm run build

```

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT.