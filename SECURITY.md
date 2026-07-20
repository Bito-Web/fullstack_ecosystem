# 🛡️ Política de Seguridad

En **Fullstack_ecosystem CLI** nos tomamos muy en serio la seguridad de los desarrolladores y de las aplicaciones que se orquestan mediante nuestro motor.

---

## 📋 Versiones Soportadas

Actualmente, solo la versión principal activa recibe parches y actualizaciones de seguridad.

| Versión | Soportada |
| :--- | :---: |
| `>= 0.1.x` (main) | ✅ |
| `< 0.1.0` | ❌ |

---

## 🚨 Reportar una Vulnerabilidad

**Por favor, NO reportes vulnerabilidades de seguridad a través de Issues públicos en GitHub.**

Si descubres una vulnerabilidad de seguridad (fugas de secretos en `.env`, inyecciones de comandos en adaptadores, fallos en parsing YAML/Zod, etc.), infórmanos de manera privada siguiendo estos pasos:

1. **Enviar un Correo Electrónico:** Envía un correo con los detalles del hallazgo a `contact@jorgetorrelles.site` *(o tu correo de contacto de seguridad)*.
2. **Incluir en el Reporte:**
   * Descripción detallada del tipo de vulnerabilidad.
   * Pasos claros para reproducir la falla (PoC / código de prueba).
   * Impacto potencial en los entornos compilados (`/dist`).
   * Tu nombre/usuario de GitHub si deseas recibir reconocimiento una vez corregido el fallo.

### ⏱️ Proceso y Tiempos de Respuesta
* **Recepción:** Confirmaremos la recepción de tu reporte en un plazo máximo de **48 horas**.
* **Evaluación:** Analizaremos el impacto y la validez de la vulnerabilidad en un plazo de **5 días hábiles**.
* **Corrección:** Si la vulnerabilidad se confirma, lanzaremos un parche en una versión menor/parche e informaremos en las notas de la versión.

Agradecemos de antemano tu contribución para mantener seguro el ecosistema Fullstack_ecosystem.