# BITAYA Incluye — Project Specification

**Versión:** 1.0  
**Equipo:** BITAYA  
**Evento:** Hackathon de IA Generativa — AI Day by FAIR / Costa Rica Tech Week 2026  
**Tiempo de construcción:** 3 horas  
**Equipo:** 4 personas  
**Objetivo:** Construir una demo funcional, clara, ética y convincente que conecte directamente con un LLM real.

---

## 1. Norte del proyecto

### Nombre del producto

**BITAYA Incluye**

### Tagline

> IA responsable para convertir una situación vulnerable en una ruta clara de ayuda.

### One-liner

> BITAYA Incluye ayuda a personas vulnerables en Costa Rica a describir su situación en lenguaje simple y recibir una ruta inicial de orientación: institución sugerida, datos faltantes, próximos pasos, mensaje listo para solicitar ayuda y revisión humana obligatoria.

### Frase estratégica para pitch

> La información pública no sirve si la persona que más la necesita no sabe cómo encontrarla, entenderla o usarla. BITAYA Incluye convierte vulnerabilidad en una ruta clara de acción.

---

## 2. Problema

En Costa Rica, muchas personas en condición vulnerable no saben dónde pedir ayuda, qué institución corresponde, qué información deben presentar o cómo redactar su situación para iniciar una solicitud.

La información pública existe, pero suele estar:

- Dispersa entre múltiples instituciones.
- Escrita en lenguaje institucional.
- Difícil de navegar para personas con bajo acceso digital.
- Poco orientada a personas que no saben qué trámite necesitan.
- Separada de la realidad emocional de alguien vulnerable.

### Ejemplos de personas afectadas

- Una mujer embarazada sin ingresos que no sabe dónde pedir orientación.
- Un adulto mayor que vive solo y necesita apoyo.
- Una persona con discapacidad que no sabe cómo consultar sobre certificación, transporte, empleo o servicios.
- Una mujer en situación de violencia que necesita saber cuál es el primer paso seguro.
- Una familia sin ingresos que no sabe si debe acudir al IMAS, municipalidad, centro de salud u otra institución.

### Problema central

> La barrera no es solo falta de información. Es falta de orientación accionable desde lenguaje humano hacia rutas institucionales comprensibles.

---

## 3. Solución propuesta

BITAYA Incluye es una aplicación web que permite a una persona escribir su situación con sus propias palabras. La app envía el texto a un LLM real junto con una base de conocimiento local y recibe una ruta de ayuda estructurada.

La IA no decide beneficios, no determina elegibilidad y no reemplaza instituciones. Su función es:

- Interpretar lenguaje natural.
- Detectar la situación principal.
- Clasificar el tipo de vulnerabilidad.
- Sugerir instituciones posibles.
- Identificar datos faltantes.
- Proponer próximos pasos seguros.
- Generar un mensaje listo para copiar.
- Explicar por qué se sugirió esa ruta.
- Marcar que todo requiere revisión humana.

---

## 4. Objetivo de la demo

Construir una demo en vivo que muestre el flujo completo:

```txt
Persona escribe su situación
        ↓
App llama a IA real
        ↓
IA analiza usando una base de conocimiento local
        ↓
App muestra ruta de ayuda clara y accionable
        ↓
App muestra advertencia de IA responsable
        ↓
Dashboard institucional muestra casos orientados
```

### Lo que debe funcionar obligatoriamente

- La app abre en navegador.
- El usuario escribe en un textarea.
- El botón llama a `/api/analyze`.
- El endpoint conecta con un LLM real.
- El resultado se muestra en tarjetas.
- Hay fallback si falla la API.
- Hay dashboard institucional estático.
- Hay mensajes claros de revisión humana.

---

## 5. Estrategia para ganar

El proyecto debe maximizar cinco dimensiones:

| Criterio | Estrategia de BITAYA Incluye |
|---|---|
| Problema y relevancia | Poblaciones vulnerables, acceso a ayuda, barreras reales |
| Ejecución técnica | LLM real conectado por API + JSON estructurado + fallback |
| Diseño y proceso | Flujo simple: situación → ruta de ayuda → mensaje listo |
| Impacto potencial | Uso por municipalidades, ONG, instituciones, centros educativos y ventanillas ciudadanas |
| Presentación | Historia humana, demo funcional, IA responsable y cierre contundente |

### Ventaja competitiva

Otros equipos pueden enfocarse en datos públicos o productividad. BITAYA Incluye se enfoca en el primer paso humano:

> No solo consultar información pública, sino ayudar a una persona vulnerable a convertir su necesidad en una acción concreta.

---

## 6. Alcance del MVP

### In scope

Para la demo de 3 horas, el producto incluye:

1. Página principal ciudadana.
2. Textarea para describir una situación vulnerable.
3. Botones con casos de ejemplo.
4. API route `/api/analyze`.
5. Conexión real con LLM.
6. Knowledge base local.
7. Respuesta JSON estructurada.
8. Tarjetas de resultado.
9. Mensaje listo para copiar.
10. Advertencia de IA responsable.
11. Dashboard institucional estático.
12. Fallback seguro si la API falla.

### Out of scope

No construir durante el hackathon:

- Login.
- Base de datos real.
- Scraping en vivo.
- Vector DB.
- Mapas.
- WhatsApp real.
- PDF real.
- Autenticación.
- Roles avanzados.
- Integraciones institucionales reales.
- Trámites completos.
- Elegibilidad automatizada.
- Diagnósticos médicos, legales o psicológicos.

---

## 7. Stack técnico

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- App Router
- Componentes simples en React

### Backend

- API Route de Next.js: `src/app/api/analyze/route.ts`

### IA

Proveedor por defecto:

- OpenAI Responses API
- Modelo: `gpt-4.1-mini`
- Variable: `OPENAI_API_KEY`

Alternativas aceptables si el equipo decide cambiar:

- Claude API
- Gemini API

### Persistencia

- No usar base de datos.
- Datos demo estáticos en frontend.
- Knowledge base local en TypeScript.

---

## 8. Estructura de archivos

```txt
bitaya-incluye/
├── .env.local
├── package.json
├── README.md
├── PROJECT_SPEC.md
└── src/
    ├── app/
    │   ├── api/
    │   │   └── analyze/
    │   │       └── route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── lib/
    │   └── knowledgeBase.ts
    └── types/
        └── analysis.ts
```

---

## 9. Variables de entorno

Archivo: `.env.local`

```bash
OPENAI_API_KEY=your_api_key_here
```

Reglas:

- No subir `.env.local` al repositorio.
- No exponer la API key en frontend.
- Todas las llamadas al LLM deben pasar por `/api/analyze`.

---

## 10. Contrato de datos

### Request al endpoint

`POST /api/analyze`

```json
{
  "message": "Estoy embarazada, tengo 19 años, no tengo trabajo y no sé dónde pedir ayuda."
}
```

### Response esperado

```ts
export interface HelpRouteAnalysis {
  caseTitle: string;
  detectedSituation: string;
  vulnerabilityCategory: string;
  urgencyLevel: "Baja" | "Media" | "Media-alta" | "Alta";
  suggestedInstitutions: string[];
  missingData: string[];
  nextSteps: string[];
  copyReadyMessage: string;
  officialSummary: string;
  responsibleAIWarning: string;
  humanReviewRequired: boolean;
  confidence: number;
  whyThisRoute: string[];
}
```

### Ejemplo de response

```json
{
  "caseTitle": "Orientación para embarazo y vulnerabilidad económica",
  "detectedSituation": "Persona embarazada sin ingresos estables que solicita orientación inicial.",
  "vulnerabilityCategory": "Embarazo y apoyo social",
  "urgencyLevel": "Media-alta",
  "suggestedInstitutions": ["Centro de salud correspondiente", "CCSS", "IMAS", "INAMU"],
  "missingData": ["Cantón", "Edad", "Semanas de embarazo", "Si tiene seguro", "Red de apoyo"],
  "nextSteps": [
    "Buscar orientación en el centro de salud correspondiente.",
    "Preparar información básica sobre situación económica y familiar.",
    "Solicitar orientación social en una institución competente."
  ],
  "copyReadyMessage": "Buenas, solicito orientación porque estoy embarazada, no tengo ingresos estables y necesito saber qué opciones de apoyo o atención puedo recibir. Puedo brindar más información sobre mi cantón, edad, semanas de embarazo y situación familiar.",
  "officialSummary": "Persona embarazada reporta vulnerabilidad económica y requiere orientación inicial para servicios de salud y apoyo social. Requiere revisión institucional.",
  "responsibleAIWarning": "Esta orientación es informativa. La IA no determina elegibilidad ni reemplaza la revisión humana o institucional.",
  "humanReviewRequired": true,
  "confidence": 0.82,
  "whyThisRoute": [
    "El mensaje menciona embarazo.",
    "El mensaje menciona falta de trabajo o ingresos.",
    "La situación requiere orientación de salud y apoyo social."
  ]
}
```

---

## 11. Knowledge base local

Archivo: `src/lib/knowledgeBase.ts`

Debe contener 8 entradas.

### Forma de cada entrada

```ts
export interface KnowledgeBaseEntry {
  id: string;
  category: string;
  population: string[];
  detectableSituations: string[];
  suggestedInstitutions: string[];
  dataToAsk: string[];
  safeNextSteps: string[];
  warning: string;
}
```

### Entradas obligatorias

1. **IMAS / apoyo social y pobreza**
2. **Embarazo vulnerable / CCSS, IMAS, INAMU**
3. **PANI / niñez y adolescencia en riesgo**
4. **INAMU / violencia contra mujeres**
5. **CONAPDIS / discapacidad**
6. **CONAPAM / persona adulta mayor**
7. **MTSS / Agencia Nacional de Empleo**
8. **Emergencias / 9-1-1**

---

## 12. Prompt del LLM

El endpoint debe construir un prompt con la siguiente intención:

```txt
Eres BITAYA Incluye, un asistente de orientación social para Costa Rica.

Tu tarea es convertir una situación escrita por una persona vulnerable en una ruta inicial de ayuda.

Reglas:
- No determines elegibilidad.
- No prometas beneficios.
- No des diagnóstico médico, legal ni psicológico.
- No inventes trámites específicos si no están en la base de conocimiento.
- Siempre indica que se requiere revisión humana o institucional.
- Si detectas peligro inmediato, indica contactar 9-1-1.
- Responde SOLO en JSON válido.
- Usa lenguaje claro, cálido, humano y no técnico.

Base de conocimiento:
{{knowledgeBase}}

Situación de la persona:
{{message}}

Devuelve exactamente este JSON:
{
  "caseTitle": string,
  "detectedSituation": string,
  "vulnerabilityCategory": string,
  "urgencyLevel": "Baja" | "Media" | "Media-alta" | "Alta",
  "suggestedInstitutions": string[],
  "missingData": string[],
  "nextSteps": string[],
  "copyReadyMessage": string,
  "officialSummary": string,
  "responsibleAIWarning": string,
  "humanReviewRequired": boolean,
  "confidence": number,
  "whyThisRoute": string[]
}
```

---

## 13. Reglas de IA responsable

La app debe mostrar explícitamente:

> BITAYA Incluye no determina elegibilidad, no reemplaza a instituciones públicas y no atiende emergencias. Su función es orientar, ordenar información y ayudar a preparar el primer contacto. Toda ruta requiere revisión humana.

### Reglas internas

- Nunca prometer que una institución dará ayuda.
- Nunca afirmar que una persona califica para un beneficio.
- Nunca dar diagnóstico médico.
- Nunca dar asesoría legal definitiva.
- Nunca pedir datos sensibles innecesarios.
- Siempre sugerir revisión humana.
- En riesgo inmediato, redirigir a 9-1-1.
- En violencia, priorizar seguridad.
- En niñez/adolescencia, elevar urgencia y revisión humana.
- En dudas, pedir más información antes de orientar con precisión.

---

## 14. UI requerida

### Página principal

Debe incluir:

- Logo o nombre: `BITAYA Incluye`
- Título: `¿No sabés dónde pedir ayuda?`
- Subtítulo:
  > Contanos tu situación con tus propias palabras. BITAYA Incluye usa IA responsable para ayudarte a encontrar una ruta inicial de orientación.
- Textarea grande.
- Botón principal: `Crear ruta de ayuda`
- Botones de ejemplo.
- Bloque de advertencia responsable.

### Ejemplos clicables

1. `Estoy embarazada, tengo 19 años, no tengo trabajo y no sé dónde pedir ayuda. Vivo con mi mamá y me preocupa no poder comprar cosas básicas.`
2. `Mi abuelo vive solo, casi no puede caminar y no sabemos dónde pedir ayuda para que alguien nos oriente.`
3. `Tengo miedo de mi pareja porque me amenaza y no sé qué hacer. Tengo un hijo pequeño.`
4. `Mi hermano tiene una discapacidad y no sabemos cómo pedir orientación para transporte, trabajo o certificación.`

---

## 15. Resultado visual requerido

Cuando existe análisis, renderizar tarjetas:

1. **Título del caso**
2. **Situación detectada**
3. **Categoría**
4. **Urgencia**
5. **Instituciones sugeridas**
6. **Datos faltantes**
7. **Próximos pasos**
8. **Mensaje listo para copiar**
9. **Resumen institucional**
10. **Por qué se sugirió esta ruta**
11. **Advertencia IA responsable**
12. **Revisión humana requerida**

### Botón

- `Copiar mensaje`

Debe copiar `copyReadyMessage` al portapapeles.

---

## 16. Dashboard institucional demo

Debe ser estático, sin base de datos.

### Métricas

| Métrica | Valor |
|---|---|
| Casos orientados | 4 |
| Requieren revisión humana | 4 |
| Alta prioridad | 2 |
| Mensajes generados | 4 |

### Tabla demo

| Caso | Categoría | Urgencia | Estado |
|---|---|---|---|
| Embarazada sin ingresos | Salud y apoyo social | Media-alta | Requiere orientación |
| Adulto mayor solo | Persona adulta mayor | Alta | Prioritario |
| Mujer con miedo de su pareja | Violencia | Alta | Seguridad primero |
| Persona con discapacidad necesita orientación | Discapacidad | Media | Orientación inicial |

---

## 17. Diseño visual

### Estilo

- Civic-tech.
- Limpio.
- Profesional.
- Humano.
- Confiable.
- Moderno.

### Paleta sugerida

- Verde profundo.
- Azul institucional.
- Blanco.
- Grises suaves.
- Amarillo o naranja únicamente para advertencias.

### Requisitos UI

- Responsive.
- Cards con bordes redondeados.
- Jerarquía clara.
- Badges de urgencia.
- Espaciado generoso.
- Loading visible.
- Error amigable.
- Advertencia responsable visible.

---

## 18. Fallback de demo

El endpoint nunca debe romper la demo.

Si falla:

- API key ausente.
- Error de OpenAI.
- JSON inválido.
- Timeout.
- Respuesta vacía.

Debe retornar un JSON seguro:

```json
{
  "caseTitle": "Ruta de ayuda generada en modo respaldo",
  "detectedSituation": "Situación vulnerable que requiere orientación inicial.",
  "vulnerabilityCategory": "Apoyo social",
  "urgencyLevel": "Media",
  "suggestedInstitutions": ["IMAS", "Municipalidad", "Centro de salud correspondiente"],
  "missingData": ["Cantón", "Edad", "Condición laboral", "Red de apoyo"],
  "nextSteps": [
    "Recolectar información básica del caso.",
    "Solicitar orientación en una institución social o municipal.",
    "Validar requisitos directamente con la institución correspondiente."
  ],
  "copyReadyMessage": "Buenas, solicito orientación porque estoy pasando por una situación vulnerable y necesito saber qué opciones de apoyo puedo recibir. Puedo brindar más información sobre mi cantón, condición familiar y situación económica.",
  "officialSummary": "Persona solicita orientación inicial por posible situación de vulnerabilidad. Requiere validación institucional.",
  "responsibleAIWarning": "Esta orientación es informativa. La IA no determina elegibilidad ni reemplaza la revisión humana o institucional.",
  "humanReviewRequired": true,
  "confidence": 0.5,
  "whyThisRoute": [
    "El mensaje indica posible necesidad de apoyo social.",
    "Faltan datos para orientar con mayor precisión.",
    "Se recomienda revisión humana."
  ]
}
```

---

## 19. Casos de demo oficiales

### Caso 1 — Embarazo vulnerable

```txt
Estoy embarazada, tengo 19 años, no tengo trabajo y no sé dónde pedir ayuda. Vivo con mi mamá y me preocupa no poder comprar cosas básicas.
```

Debe detectar:

- Embarazo.
- Vulnerabilidad económica.
- CCSS / centro de salud.
- IMAS.
- INAMU como orientación complementaria.
- Urgencia media-alta.
- Datos faltantes: cantón, semanas de embarazo, seguro, red de apoyo.

### Caso 2 — Adulto mayor

```txt
Mi abuelo vive solo, casi no puede caminar y no sabemos dónde pedir ayuda para que alguien nos oriente.
```

Debe detectar:

- Adulto mayor.
- Posible aislamiento.
- Movilidad reducida.
- CONAPAM / Municipalidad.
- Urgencia alta o media-alta.
- Datos faltantes: edad, cantón, condición de salud, red de apoyo.

### Caso 3 — Violencia

```txt
Tengo miedo de mi pareja porque me amenaza y no sé qué hacer. Tengo un hijo pequeño.
```

Debe detectar:

- Violencia o amenaza.
- Riesgo potencial.
- INAMU.
- 9-1-1 si hay peligro inmediato.
- Menor involucrado.
- Urgencia alta.
- Seguridad primero.

### Caso 4 — Discapacidad

```txt
Mi hermano tiene una discapacidad y no sabemos cómo pedir orientación para transporte, trabajo o certificación.
```

Debe detectar:

- Discapacidad.
- Necesidad de orientación.
- CONAPDIS.
- Municipalidad o centro de salud como apoyo.
- Urgencia media.
- Datos faltantes: cantón, certificación, necesidad principal.

---

## 20. Roles del equipo

### Persona 1 — Frontend Lead

Responsable de:

- `src/app/page.tsx`
- UI ciudadana.
- Cards de resultados.
- Loading/error states.
- Botón copiar mensaje.

### Persona 2 — AI Backend Lead

Responsable de:

- `/api/analyze`
- Conexión con LLM.
- Prompt.
- Parseo JSON.
- Fallback.
- Variables de entorno.

### Persona 3 — Knowledge + QA Lead

Responsable de:

- `knowledgeBase.ts`
- Casos demo.
- Pruebas manuales.
- Revisión de respuestas.
- Mensajes responsables.

### Persona 4 — Dashboard + Pitch Lead

Responsable de:

- Dashboard institucional.
- Métricas.
- Guion del pitch.
- Q&A.
- Historia de demo.

---

## 21. Plan de ejecución de 3 horas

### 0:00 - 0:15 — Setup

- Crear proyecto.
- Instalar dependencias.
- Correr local.
- Crear `.env.local`.
- Confirmar API key.

### 0:15 - 0:45 — Base del producto

- UI principal.
- Knowledge base.
- Tipos TypeScript.
- Estructura visual.

### 0:45 - 1:30 — IA funcional

- Crear endpoint.
- Conectar LLM.
- Validar JSON.
- Crear fallback.
- Probar con caso de embarazo.

### 1:30 - 2:10 — Integración

- Conectar formulario con API.
- Renderizar resultados.
- Agregar loading/error.
- Agregar copiar mensaje.

### 2:10 - 2:35 — Dashboard y polish

- Dashboard institucional.
- Métricas.
- Badges.
- Responsive.
- Advertencias visibles.

### 2:35 - 3:00 — QA y pitch

- Probar 4 casos.
- Ensayar demo.
- Preparar respuesta a preguntas.
- Congelar código.
- No agregar features nuevas.

---

## 22. Definition of Done

El proyecto está listo para demo cuando:

- [ ] La app corre con `npm run dev`.
- [ ] El textarea recibe texto.
- [ ] El botón llama a `/api/analyze`.
- [ ] `/api/analyze` conecta con un LLM real.
- [ ] La respuesta se parsea como JSON.
- [ ] La UI muestra todas las tarjetas.
- [ ] Hay advertencia de IA responsable.
- [ ] `humanReviewRequired` aparece como verdadero.
- [ ] El dashboard se ve completo.
- [ ] Los 4 casos demo funcionan.
- [ ] Hay fallback si falla la IA.
- [ ] El equipo puede explicar el producto en 60 segundos.
- [ ] Nadie necesita tocar código durante la presentación.

---

## 23. Pitch resumido

### Problema

> En Costa Rica, muchas personas vulnerables no saben dónde pedir ayuda. Una madre embarazada sin ingresos, un adulto mayor solo o una persona con discapacidad no siempre sabe si debe acudir al IMAS, INAMU, CONAPDIS, CONAPAM, la municipalidad o un centro de salud.

### Solución

> Construimos BITAYA Incluye, un asistente de IA responsable que convierte una situación escrita en lenguaje simple en una ruta clara de ayuda.

### Demo

Mostrar:

1. Caso de embarazo vulnerable.
2. Resultado IA.
3. Instituciones sugeridas.
4. Datos faltantes.
5. Mensaje listo para copiar.
6. Revisión humana.
7. Dashboard.

### Impacto

> BITAYA Incluye puede ser usado por municipalidades, ONG, centros educativos, instituciones públicas y ventanillas ciudadanas para reducir fricción, orientar mejor y ayudar a que una persona vulnerable dé el primer paso correcto.

### Cierre

> No centralizamos toda la información pública. Centralizamos el primer paso correcto para una persona que no sabe dónde pedir ayuda.

---

## 24. Q&A del jurado

### ¿Cómo evitan que la IA invente?

Usamos una base de conocimiento local, pedimos JSON estructurado, mostramos nivel de confianza, incluimos advertencias y dejamos revisión humana obligatoria. La IA orienta, no decide.

### ¿Por qué no es solo un chatbot?

Porque no busca conversar. Busca transformar una situación vulnerable en una ruta accionable: institución sugerida, datos faltantes, próximos pasos y mensaje listo para pedir orientación.

### ¿Qué pasa si la persona está en peligro?

La app debe indicar contactar 9-1-1. BITAYA Incluye no atiende emergencias.

### ¿Cómo escalaría?

Se puede conectar a catálogos oficiales, bases institucionales, WhatsApp, municipalidades, ONG y ventanillas ciudadanas.

### ¿Cómo miden impacto?

Tiempo ahorrado en orientación inicial, cantidad de casos clasificados, datos faltantes detectados, mensajes generados y derivaciones correctas.

### ¿La IA decide si una persona recibe ayuda?

No. La IA no determina elegibilidad. Solo prepara orientación inicial y recomienda revisión humana.

---

## 25. Mensajes estratégicos para repetir

- No es una wiki; es un orientador de primer paso.
- La IA no decide elegibilidad.
- La solución reduce fricción para personas vulnerables.
- Convierte lenguaje humano en una ruta institucional.
- Está pensada para revisión humana.
- No prometemos beneficios; preparamos el primer contacto.
- La información pública no sirve si la persona no sabe cómo usarla.
- En 3 horas construimos una pieza pequeña, pero crítica: el puente entre necesidad y orientación.

---

## 26. Comandos de arranque

```bash
npx create-next-app@latest bitaya-incluye --ts --tailwind --eslint --app --src-dir
cd bitaya-incluye
npm run dev
```

Crear `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

---

## 27. Prompt inicial recomendado para Codex/Claude

```txt
Read PROJECT_SPEC.md completely before coding.

Build BITAYA Incluye exactly as specified.

Prioritize:
1. Working demo.
2. Real LLM connection.
3. Structured JSON.
4. Responsible AI warning.
5. Clear Spanish UI.
6. Demo stability.

Do not add login, database, scraping, maps, PDF generation, WhatsApp, vector DB or complex routing.

Implement the minimum product described in the spec and make sure npm run dev works.
```

---

## 28. Regla final

> Primero que funcione. Luego que se vea bonito. Luego que suene ganador.

Durante el hackathon, cualquier decisión debe responder:

**¿Esto mejora la demo, la claridad, la IA real o el impacto?**

Si la respuesta es no, no se hace.
