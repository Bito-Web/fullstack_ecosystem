# 🚀 Fullstack Ecosystem (Mystack CLI)

> **Un único manifiesto declarativo para orquestar tu servidor web, backend, frontend y base de datos sin fricción.**

**Mystack** es un motor CLI que resuelve la fragmentación del stack de desarrollo web. En lugar de dispersar la configuración entre `nginx.conf`, `httpd.conf`, scripts de backend, archivos `Dockerfile` y mapas de rutas en el cliente, Mystack utiliza **un único archivo manifiesto (`app.yaml`) como la Única Fuente de Verdad (*Single Source of Truth*)**.

---

## 🎨 Arquitectura Agnóstica a Frameworks

Mystack **no te encierra en ningún framework ni librería específica**. Está diseñado para ser completamente agnóstico:

* **Frontend:** Puedes utilizar HTML/JS nativo, o integrar librerías y frameworks como React, Vue, Svelte, Angular, Astro o Vite en tu directorio fuente.
* **Backend:** Soporta Node.js (Express, Fastify, NestJS), Python (FastAPI, Django), PHP, Java, Go, o cualquier runtime de tu elección.
* **Servidor Web:** Intercambia entre Nginx, Apache (`httpd`) o proxies personalizados cambiando una sola línea en el manifiesto.

> 💡 **El objetivo principal de Mystack:** Proporcionar un scaffolding base y **unificar la estructura y el entorno de desarrollo mediante un único archivo `docker-compose.yml` autogenerado**. Una vez armada la base, el desarrollador tiene libertad total para instalar cualquier librería o dependencia adicional en sus respectivos directorios.

---

## 🎯 ¿Por qué Mystack?

* **Estructura Unificada:** Centraliza la infraestructura de tu proyecto en un solo lugar.
* **Cero desacople de rutas:** Declaras un endpoint una sola vez y el CLI genera el proxy en Nginx/Apache, el handler en el Backend y la regla de seguridad correspondiente.
* **Seguridad y Cabeceras por defecto:** Configura headers globales (CORS, CSP, X-Frame-Options) y middleware de autenticación automático (`protected: true`) directamente en el manifiesto.
* **Manejo de Secretos (.env):** Inyecta variables dinámicas `${VAR_SECRET}` en tu manifiesto sin exponer contraseñas en tu repositorio Git.
* **Orquestación transparente:** Genera automáticamente la infraestructura con `docker-compose.yml`, contenedores aislados y entornos listos para producción o desarrollo.
* **Modo Interactivo (Watch Mode):** Recompila la infraestructura en tiempo real y refresca los contenedores al editar el manifiesto.

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
|    (Zod)      |       |  (ASTBuilder) |       | (Nginx, Apache,   |
+---------------+       +---------------+       | Express, Docker)  |
                                                +-------------------+
                                                          |
                                                          v
                                        +----------------------------------+
                                        |  Carpeta /dist compilada         |
                                        |  - .env                          |
                                        |  - docker-compose.yml            |
                                        |  - server/nginx.conf o httpd.conf|
                                        |  - backend/server.js             |
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
│   │   ├── adapters/         # Adaptadores (Nginx, Apache, Express, Docker, Frontend)
│   │   │   ├── base.adapter.ts
│   │   │   ├── nginx.adapter.ts
│   │   │   ├── apache.adapter.ts
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
  engine: nginx # o 'apache2'
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

```

### 3. Compilar Infraestructura (`build`)

Transpila el manifiesto en un AST, resuelve variables de entorno e inyecta middlewares para generar los artefactos en la carpeta `/dist`:

```bash
npm run build

```

**Artefactos generados en `/dist`:**

* `.env`: Variables de entorno resolviendo sintaxis `${VAR}`.
* `docker-compose.yml`: Configuración de servicios (Server, Backend, Database) en red bridge unificada.
* `server/nginx.conf` o `server/httpd.conf`: Configuración del servidor proxy web según el motor seleccionado.
* `backend/server.js`: Servidor Express con rutas mapeadas y `authMiddleware` inyectado en endpoints protegidos.
* `backend/package.json` y `Dockerfile`: Entorno aislado para el backend.
* `front/home.html`: Vista de cliente generada para consumir la API.

### 4. Modo Desarrollo (`dev`)

Inicia el watcher en tiempo real. Al modificar y guardar `app.yaml`, recompila la carpeta `/dist` y actualiza los contenedores Docker automáticamente:

```bash
npm run dev

```

---

## 🐋 Instalación de Docker Desktop (Requisito para `npm run dev`)

Para que Mystack pueda orquestar tus contenedores en tiempo real durante `npm run dev`, se requiere tener **Docker Engine / Docker Desktop** disponible.

> ⚡ **Auto-Instalación vía Mystack CLI:** Si ejecutas `npm run dev` y el CLI detecta que Docker no está en tu sistema, te preguntará si deseas instalarlo automáticamente usando el gestor de paquetes correspondiente a tu SO (`winget`, `brew` o `curl`).

Si prefieres instalarlo manualmente, sigue los pasos según tu sistema operativo:

### 🪟 Windows (Windows 10 / 11)

1. **Requisito previo:** Asegúrate de tener activado **WSL2** (Windows Subsystem for Linux). Puedes instalarlo abriendo PowerShell como Administrador y ejecutando:
```powershell
wsl --install

```


2. **Opción Terminal (Winget):**
```powershell
winget install Docker.DockerDesktop

```


3. **Opción Manual:** Descarga el instalador ejecutable directamente desde el [Sitio Oficial de Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/).

---

### 🍎 macOS (Intel / Apple Silicon)

1. **Opción Terminal (Homebrew):**
```bash
brew install --cask docker

```


2. **Opción Manual:** Descarga la versión según tu chip (Apple Silicon M1/M2/M3/M4 o Intel) desde el [Sitio Oficial de Docker Desktop para Mac](https://docs.docker.com/desktop/setup/install/mac-install/).

---

### 🐧 Linux (Ubuntu, Debian, Fedora, CentOS)

1. **Opción Rápida (Script oficial):**
```bash
curl -fsSL [https://get.docker.com](https://get.docker.com) -o get-docker.sh
sudo sh get-docker.sh

```


2. **Agregar tu usuario al grupo `docker**` (para no requerir `sudo` en cada comando):
```bash
sudo usermod -aG docker $USER
newgrp docker

```


3. **Instalar el plugin Docker Compose V2:**
```bash
sudo apt-get update && sudo apt-get install docker-compose-plugin

```



---

## 🛠️ Instalación del Proyecto

* **Node.js**: `>= 18.0.0`
* **TypeScript**: `>= 5.0.0`

```bash
# 1. Clonar el repositorio
git clone [https://github.com/Bito-Web/fullstack_ecosystem.git](https://github.com/Bito-Web/fullstack_ecosystem.git)

# 2. Entrar al proyecto
cd fullstack_ecosystem

# 3. Instalar dependencias
npm install

# 4. Crear tu manifiesto app.yaml
npm run init

# 5. Compilar o Iniciar en modo desarrollo
npm run build
npm run dev

```

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT.