# HealthGuide AI — Frontend

Capa de canal (Web app) de `docs/arquitectura.md`: un formulario de síntomas
que le habla al backend por HTTP y nada más — sin lógica de triage, sin
validación de seguridad, sin llamadas al modelo. Si el backend cambia de
proveedor o de reglas, este proyecto no se entera.

```
src/
  api/triageApi.js       -> unico punto de contacto con el backend (fetch a /api/triage)
  components/            -> SymptomForm, ResultCard, PriorityBadge, DisclaimerBanner, HumanReviewAlert
  constants/priority.js  -> metadatos de presentacion por nivel de prioridad
  styles/                -> design tokens (colores, tipografia) + estilos globales
```

## Cómo correr

1. Copia `.env.example` a `.env` (por defecto apunta a `http://127.0.0.1:8000/api`,
   ajusta `VITE_API_BASE_URL` si el backend corre en otro puerto).
2. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

3. Abre `http://localhost:5173` con el backend corriendo en paralelo.

## Decisiones de diseño

- **Sistema de diseño generado para el dominio de salud** (paleta cian/verde calmada,
  tipografía Figtree/Noto Sans, estilo "Accessible & Ethical"): alto contraste, sin
  gradientes ni animaciones agresivas, `prefers-reduced-motion` respetado, focus rings
  visibles, objetivos táctiles de 44px mínimo.
- **El color de prioridad es semántico y separado de la marca** (`styles/tokens.css`):
  verde/ámbar/naranja/rojo para BAJA/MEDIA/ALTA/EMERGENCIA, independiente de la paleta
  de marca cian — para que la urgencia se lea de inmediato sin depender solo del texto.
- **El aviso de "requiere revisión humana" y el disclaimer no son opcionales ni
  descartables** — están siempre visibles cuando aplican, con `role="alert"` para que
  lectores de pantalla los anuncien.
- **Sin librería de iconos externa**: son SVG inline propios (ver `components/icons.jsx`)
  para no agregar una dependencia solo por unos pocos íconos, y para no usar emojis como
  ícono de UI.
