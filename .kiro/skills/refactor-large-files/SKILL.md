---
name: refactor-large-files
description: Refactoriza archivos de código que superan las 100 líneas, dividiéndolos en módulos más pequeños y cohesivos sin cambiar su comportamiento. Úsala cuando el usuario pida refactorizar un archivo largo, dividir un módulo, reducir el tamaño de un archivo, o cuando detectes un archivo de código de más de 100 líneas que mezcla responsabilidades.
---

# Refactorizar archivos de código de más de 100 líneas

Objetivo: dividir un archivo largo en piezas más pequeñas y cohesivas, sin cambiar el
comportamiento observable del sistema. Esto es refactor, no reescritura: mismo comportamiento,
mejor estructura.

## Cuándo aplica

- El archivo objetivo tiene más de 100 líneas de código (sin contar comentarios/blank lines
  si el lenguaje lo permite calcular fácil, pero no hace falta ser exacto: si el archivo pasa
  de 100 líneas totales, ya es candidato).
- Prioriza archivos que además mezclan responsabilidades claramente distintas (p. ej. rutas +
  lógica de negocio + acceso a datos en un mismo archivo) — esos son los que más valor tienen
  al dividirse. Un archivo largo pero de una sola responsabilidad clara (p. ej. una tabla de
  constantes) puede no necesitar división real; usa criterio y dilo si es el caso.

## Pasos

1. **Medir antes de tocar nada.** Confirma el conteo de líneas del archivo (ej. con
   `read_code` o contando líneas del archivo leído). Si son menos de 100 líneas, dilo y no
   sigas — no hay nada que refactorizar.

2. **Entender antes de dividir.** Lee el archivo completo. Si el archivo o su contexto no son
   familiares, o el proyecto es grande, usa el sub-agente `context-gatherer` para entender:
   - qué hace este archivo dentro del sistema
   - quién lo importa / quién lo consume (para no romper referencias)
   - qué convenciones de capas o estructura ya sigue el proyecto (revisa steering, README,
     o documentos de arquitectura del repo si existen)

3. **Identificar líneas de corte por responsabilidad, no por tamaño.** Agrupa el contenido del
   archivo en bloques cohesivos (ej: validación, transformación de datos, llamadas a I/O,
   configuración/constantes, helpers puros, orquestación). Cada bloque candidato a extraerse
   debe tener una sola razón para cambiar. Evita cortar arbitrariamente cada N líneas.

4. **Elegir destino para cada bloque extraído** siguiendo la convención ya existente en el
   proyecto (misma carpeta de módulos, mismo estilo de nombres, mismo patrón de exports/imports
   que el resto del código). Si el proyecto ya tiene una arquitectura por capas documentada,
   respétala en vez de crear una estructura nueva.

5. **Extraer de forma incremental**, no todo de un solo golpe si el archivo es complejo:
   - Mueve un bloque cohesivo a su propio archivo/módulo.
   - Actualiza imports/referencias (usa la herramienta de mover archivos con actualización
     automática de imports si está disponible, en vez de mover a mano).
   - Verifica que el archivo original ahora solo orquesta/importa, no reimplementa.
   - Repite con el siguiente bloque.

6. **No cambies comportamiento.** No renombres lógica pública, no cambies firmas de funciones
   exportadas/expuestas, no "mejores" validaciones o lógica de negocio de paso — eso es un
   cambio funcional, no un refactor, y debe acordarse aparte con el usuario si se detecta
   necesario.

7. **Verificar después de cada extracción relevante** (no solo al final):
   - Corre el build/compilador del proyecto si aplica.
   - Corre la suite de tests existente. Si no hay tests para ese archivo y el proyecto ya usa
     un framework de test, es razonable sugerir (no imponer) agregar una prueba de humo que
     cubra el comportamiento actual antes de refactorizar más a fondo — pero no agregues tests
     nuevos sin que el usuario lo haya pedido, salvo que sea imprescindible para verificar que
     el refactor no rompió nada.
   - Si algo falla, corrige antes de seguir dividiendo.

8. **Resultado final esperado:**
   - Ningún archivo tocado en el refactor debería seguir superando las 100 líneas, salvo que
     exista una razón real para no dividir más (dilo explícitamente si ese es el caso).
   - Todos los archivos nuevos deben ser importables/usables igual que antes desde el punto de
     vista de quien consumía el archivo original.
   - Build y tests en verde.

## Al terminar

Resume en pocas frases: qué archivo se dividió, en qué archivos nuevos quedó cada
responsabilidad, y qué se verificó (build/tests). No hace falta listar línea por línea, solo
la estructura resultante y el resultado de la verificación.
