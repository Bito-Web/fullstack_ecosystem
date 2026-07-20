# 🤝 Guía de Contribución a Fullstack_ecosystem CLI

¡Gracias por tu interés en contribuir a **Fullstack_ecosystem CLI**! Proyectos como este crecen gracias a la colaboración de la comunidad.

---

## 📋 Código de Conducta

Por favor, mantén un ambiente de respeto, inclusión y colaboración constructiva al interactuar en los *issues*, *discussions* o *pull requests*.

---

## 🛠️ ¿Cómo puedo contribuir?

### 1. Reportar Errores (*Bug Reports*)
Si encuentras un error o un comportamiento no deseado:
1. Revisa si el error ya ha sido reportado en la pestaña de **Issues** de GitHub.
2. Si no existe, crea un nuevo **Issue** incluyendo:
   * **Descripción clara del problema.**
   * **Pasos para reproducirlo.**
   * **Tu archivo `app.yaml` de prueba** (eliminando datos sensibles o contraseñas).
   * **Entorno:** Sistema Operativo (Windows, macOS, Linux), versión de Node.js y versión de Docker.

### 2. Sugerir Funcionalidades (*Feature Requests*)
¿Tienes una idea para un nuevo adaptador (ej. Python/FastAPI, Go, React) o un nuevo comando CLI?
* Abre un **Issue** de tipo *Feature Request* detallando el caso de uso y cómo mejoraría la experiencia del desarrollador.

---

## 💻 Flujo de Trabajo para Desarrollo Local

Si deseas escribir código o corregir un error tú mismo, sigue estos pasos:

### 1. Bifurcar y Clonar el Repositorio
```bash
# Forkea el repositorio en GitHub y luego clona tu fork:
git clone [https://github.com/Bito-Web/fullstack_ecosystem.git](https://github.com/Bito-Web/fullstack_ecosystem.git)
cd fullstack_ecosystem

```

### 2. Instalar Dependencias

```bash
npm install

```

### 3. Crear una Rama (*Branch*)

Crea una rama descriptiva para tu cambio:

```bash
git checkout -b feat/nombre-de-tu-funcionalidad
# o para correcciones:
git checkout -b fix/descripcion-del-bug

```

### 4. Probar Cambios Localmente

Puedes probar los comandos de la CLI directamente mediante los scripts de `npm`:

```bash
# Probar el comando init
npm run init

# Probar la validación de un manifiesto
npm run validate

# Probar la compilación a /dist
npm run build

# Probar el modo desarrollo con watcher
npm run dev

```

### 5. Convención de Commits

Te recomendamos seguir la convención de [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` Para nuevas funcionalidades (ej. `feat: add FastAPI adapter`).
* `fix:` Para correcciones de errores (ej. `fix: correct apache volume path in DockerAdapter`).
* `docs:` Cambios en la documentación (ej. `docs: update README with CONTRIBUTING instructions`).
* `refactor:` Cambios en el código que no alteran la funcionalidad.

### 6. Enviar Pull Request (*PR*)

1. Haz push de tus cambios a tu repositorio remoto:
```bash
git push origin mi-rama

```


2. Abre un **Pull Request** hacia la rama `main` del repositorio principal (`Bito-Web/fullstack_ecosystem`).
3. Describe detalladamente qué cambios introduce tu PR y qué problema resuelve.

---

## 🏗️ Estructura del Código

Para orientarte rápidamente en el código base:

* **`src/core/schema/`**: Definición de esquemas de validación Zod (`stack.schema.ts`).
* **`src/core/ast/`**: Lógica de construcción del AST e interpolación de variables (`ast-builder.ts`).
* **`src/generators/adapters/`**: Adaptadores específicos para cada tecnología (`nginx`, `apache`, `express`, `docker`, `frontend`).
* **`src/cli/commands/`**: Implementación de cada comando CLI (`init`, `validate`, `build`, `dev`).

---

¡Esperamos tu contribución! 🚀

```

---

### 🚀 Comandos Git para guardarlo en tu repositorio

Ejecuta estos comandos en tu terminal desde la raíz de tu proyecto:

```bash
# 1. Agregar el archivo al área de preparación
git add CONTRIBUTING.md

# 2. Crear el commit
git commit -m "docs: add CONTRIBUTING.md guide for community contributions"

# 3. Subir a GitHub
git push origin main

```