# 🚀 Fullstack Ecosystem (Fullstack_ecosystem CLI)

> **Un único manifiesto declarativo para orquestar tu servidor web, backend, frontend y base de datos sin fricción.**

**Fullstack_ecosystem** es un motor CLI que resuelve la fragmentación del stack de desarrollo web. En lugar de dispersar la configuración entre `nginx.conf`, `httpd.conf`, scripts de backend, archivos `Dockerfile` y mapas de rutas en el cliente, Fullstack_ecosystem utiliza **un único archivo manifiesto (`app.yaml`) como la Única Fuente de Verdad (*Single Source of Truth*)**.

---

## 🎨 Arquitectura Agnóstica a Frameworks

Fullstack_ecosystem **no te encierra en ningún framework ni librería específica**. Está diseñado para ser completamente agnóstico:

* **Frontend:** Puedes utilizar HTML/JS nativo, o integrar librerías y frameworks como React, Vue, Svelte, Angular, Astro o Vite en tu directorio fuente.


* **Backend:** Soporta Node.js (Express, Fastify, NestJS), Python (FastAPI, Django), PHP, Java, Go, o cualquier runtime de tu elección.


* **Servidor Web:** Intercambia entre Nginx, Apache (`httpd`) o proxies personalizados cambiando una sola línea en el manifiesto.



> 💡 **El objetivo principal de Fullstack_ecosystem:** Proporcionar un scaffolding base y **unificar la estructura y el entorno de desarrollo mediante un único archivo `docker-compose.yml` autogenerado**. Una vez armada la base, el desarrollador tiene libertad total para instalar cualquier librería o dependencia adicional en sus respectivos directorios.
> 
> 

---

## 🎯 ¿Por qué Fullstack_ecosystem?

* **Estructura Unificada:** Centraliza la infraestructura de tu proyecto en un solo lugar.


* **Soporte SSL y MIME Types de fábrica:** Configuración automática de HTTP/HTTPS (443), certificados autofirmados por defecto para desarrollo local y asignación estricta de MIME types para ES Modules.


* **Cero desacople de rutas:** Declaras un endpoint una sola vez y el CLI genera el proxy en Nginx/Apache, el handler en el Backend y la regla de seguridad correspondiente.


* **Seguridad y Cabeceras por defecto:** Configura headers globales (CORS, CSP, X-Frame-Options) y middleware de autenticación automático (`protected: true`) directamente en el manifiesto.


* **Manejo de Secretos (.env):** Inyecta variables dinámicas `${VAR_SECRET}` en tu manifiesto sin exponer contraseñas en tu repositorio Git.


* **Empaquetado para Cliente Autónomo:** Genera los scripts necesarios (`package-client.mjs`, `init-ssl.sh`) para empaquetar proyectos distribuidos hacia un directorio autónomo (`release-client/`).
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
               |   CLI Engine (fullstack_ecosystem)|
               +----------------------------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +-------------------+
|     Parser    | ----> | Core Runtime  | ----> |   Generadores /   |
| & Validaciones|       |   (AST Map)   |       |    Adaptadores    |
|    (Zod)      |       |  (ASTBuilder) |       |  (Apache, Nginx,  |
+---------------+       +---------------+       |  Express, Docker, |
                                                | Database, Scripts)|
                                                +-------------------+
                                                          |
                                                          v
                                        +----------------------------------+
                                        |  Carpeta /dist compilada         |
                                        |  - .env & .gitignore             |
                                        |  - package.json & docker-compose |
                                        |  - server/httpd.conf & certs/    |
                                        |  - backend/ & database/          |
                                        |  - frontend/index.html           |
                                        |  - scripts/ (package & ssl)      |
                                        +----------------------------------+

```

---

## 📁 Estructura del Proyecto

```text
FULLSTACK_ECOSYSTEM/
├── bin/
│   └── fullstack_ecosystem.ts            # Punto de entrada ejecutable CLI
├── src/
│   ├── cli/
│   │   ├── commands/                     # Comandos CLI (init, validate, build, dev)
│   │   │   ├── init.ts
│   │   │   ├── validate.ts
│   │   │   ├── build.ts
│   │   │   └── dev.ts
│   │   └── index.ts                      # Registro de comandos Commander
│   ├── core/
│   │   ├── parser/                       # Carga y lectura de archivos YAML
│   │   ├── schema/                       # Esquemas de validación Zod
│   │   └── ast/                          # Construcción del AST e interpolación .env
│   ├── generators/                       # Motor de adaptadores y plantillas
│   │   ├── adapters/                     # Adaptadores de infraestructura
│   │   │   ├── base.adapter.ts
│   │   │   ├── nginx.adapter.ts
│   │   │   ├── apache.adapter.ts
│   │   │   ├── express.adapter.ts
│   │   │   ├── docker.adapter.ts
│   │   │   ├── frontend.adapter.ts
│   │   │   ├── database.adapter.ts       # Adaptador para scripts init.sql
│   │   │   └── scripts.adapter.ts        # Adaptador para herramientas de empaquetado
│   │   ├── templates/                    # Plantillas de UI y código base
│   │   │   └── frontend.template.ts
│   │   └── generator-engine.ts           # Orquestador de generación de archivos
│   └── utils/                            # Utilidades de logs
├── app.yaml                              # Manifiesto principal del proyecto
├── examples/
│   └── app.yaml                          # Ejemplo de manifiesto de referencia
├── ROADMAP.md                            # Fases del proyecto
├── package.json
└── tsconfig.json

```

---

## 📄 Ejemplo de Manifiesto (`app.yaml`)

```yaml
name: mi-app-fullstack
version: 1.0.0

server:
  engine: apache2 # o 'nginx'
  version: "1.24"
  ports: [80, 443]
  headers:
    Referrer-Policy: strict-origin
    X-Frame-Options: DENY
  routes:
    get:
      - path: /
        handler: include(frontend/index.html)
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

Transpila el manifiesto en un AST, resuelve variables de entorno, genera los certificados SSL autofirmados de desarrollo y construye el entorno autónomo en la carpeta `/dist`:

```bash
npm run build

```

**Artefactos autogenerados en `/dist`:**

* `.env` y `.gitignore`: Variables de entorno (`DOMAIN_NAME`, `ADMIN_EMAIL`, secretos) y reglas de exclusión Git.


* `package.json`: Configuración de dependencias y script de empaquetado para el cliente.
* `docker-compose.yml`: Configuración de servicios en red bridge unificada con rutas relativas.


* `server/httpd.conf` o `server/nginx.conf`: Servidor web preconfigurado con SSL (443), redirecciones HTTP->HTTPS, MIME Types y proxy reverso a Express.


* `server/certs/`: Llaves SSL autofirmadas (`fullchain.pem` y `privkey.pem`) generadas automáticamente vía OpenSSL.
* `backend/`: Servidor Express (`server.js`), `package.json` y `Dockerfile` aislado.


* `database/init.sql`: Script SQL inicial con esquemas y datos de prueba.


* `frontend/index.html`: Vista de cliente generada lista para consumir la API.


* `scripts/`:
* `package-client.mjs`: Script ESM que compila y empaqueta el cliente en la carpeta `release-client/`.
* `init-ssl.sh`: Utility Bash para aprovisionamiento de certificados reales con Let's Encrypt / Certbot en producción.



### 4. Modo Desarrollo (`dev`)

Inicia el watcher en tiempo real. Al modificar y guardar `app.yaml`, recompila la carpeta `/dist` y actualiza los contenedores Docker automáticamente:

```bash
npm run dev

```

### 5. Empaquetar Cliente Distribuible (`package:client`)

Ejecuta el empaquetado de producción generando la carpeta distribuible `release-client/`:

```bash
cd dist
npm run package:client

```

---

## 🐋 Instalación de Docker Desktop (Requisito para `npm run dev`)

Para que Fullstack_ecosystem pueda orquestar tus contenedores en tiempo real durante `npm run dev`, se requiere tener **Docker Engine / Docker Desktop** disponible.

> ⚡ **Auto-Instalación vía Fullstack_ecosystem CLI:** Si ejecutas `npm run dev` y el CLI detecta que Docker no está en tu sistema, te preguntará si deseas instalarlo automáticamente usando el gestor de paquetes correspondiente a tu SO (`winget`, `brew` o `curl`).
> 
> 

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
curl -fsSL https://get.docker.com -o get-docker.sh
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
git clone https://github.com/Bito-Web/fullstack_ecosystem.git

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