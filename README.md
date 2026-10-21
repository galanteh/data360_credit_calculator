# Data 360 Credit Calculator

> Herramienta interactiva de preventa y dimensionamiento técnico para estimar créditos anuales de uso de **Salesforce Data 360 (Data Cloud)** con precisión del 99% frente a la calculadora oficial.

## 🌐 Demo en Vivo

Prueba la aplicación desplegada en Heroku:  
👉 **[Probar Calculadora en Vivo](https://data360-credit-calculator.herokuapp.com)**  
*(Requiere deploy previo — ver sección [Despliegue en Heroku](#-despliegue-en-heroku))*

---

## 🎯 ¿Qué es y para qué sirve?

Permite a equipos comerciales, Solution Engineers y arquitectos calcular el consumo anual de **Data Services Credits (DSC)** a partir de parámetros operativos:

- Volumen de perfiles unificados (N)
- Registros de interacción / engagement histórico
- Reglas de resolución de identidad
- Frecuencia de refresco de segmentos
- Canales de activación (Email, SMS/WhatsApp, Push, Paid Media)

El resultado es una estimación técnica precisa del gasto en créditos Data 360, desglosada por categoría, con equivalencia en SKUs comerciales y un modelo de ROI financiero.

---

## ⚡ Características Principales

| Funcionalidad | Descripción |
|---|---|
| **Motor V3 Oficial** | Fórmulas de volumen anual para las 10 categorías de créditos de Data Cloud |
| **Desglose por categoría** | Ingestion, Transform, Streaming, Identity Resolution, Calculated Insights, Queries, Segmentación, Activación y Data Graphs |
| **Equivalencia de SKUs** | Calcula créditos totales y cantidad de DSC SKUs necesarios (1 SKU = 100,000 créditos) |
| **Descuentos por Edición** | Flex Only, Profiles & Flex (−15%) y Enterprise Profiles & Flex (−30%) |
| **Cargar Caso Demo** | Botón de carga rápida con datos de ejemplo de referencia oficial (2M perfiles, 9M engagement, ~11.2M créditos) |
| **Logo del cliente** | Upload drag & drop (PNG/JPG/SVG) para personalizar el reporte con la marca del cliente |
| **PDF ejecutivo** | Generación en el navegador de un informe de 2 páginas con jsPDF: créditos por categoría, ROI, parámetros y disclaimer |
| **Índice de Madurez** | Puntuación 0–100 en 5 dimensiones: Streaming, Identidad, Segmentación, Analítica y Canales |

---

## 🧮 Motor de Cálculo V3 — Fórmulas

El motor (`src/engine/calculatorEngine.ts`) implementa las fórmulas oficiales de Salesforce:

```
batch_pipeline_vol   = (N × daily_update% × 365) + (engagement × daily_update% × timeframe)
transform_vol        = (N + engagement) × lookback_months × (365/12)
stream_eng_vol       = engagement × stream_eng% × 365
stream_prof_vol      = N × stream_prof% × 365
unification_vol      = (N × ir_rulesets × (12 + daily_update% × 365)) / 3
calc_insights_vol    = (insights_día × 365 × N × lookback_months) / 8
query_vol            = (queries_día × 365 × engagement × daily_update% × lookback) / timeframe
segmentation_vol     = segments × refresh × 365 × N × (1 + eng/N) × daily_update%
activation_vol       = activaciones_año × N × 0.33
data_graphs_credits  = graphs × 500
```

**Tarifas de créditos (por millón de filas):**

| Categoría | Tarifa |
|---|---|
| Batch Pipeline | 2,000 |
| Transform | 400 |
| Streaming (Eng/Prof/Transform) | 5,000 |
| Identity Resolution | 100,000 |
| Calculated Insights | 15 |
| Queries | 2 |
| Segmentación | 20 |
| Activación | 10 |
| Data Graphs | 500 por grafo |

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **PDF**: jsPDF (generación programática, sin html2canvas)
- **Build tool**: Vite 5
- **Servidor de producción**: Node.js + Express (SPA fallback)
- **Deploy**: Heroku (Procfile + `web: npm start`)

---

## 🚀 Instalación y Ejecución Local

```bash
# Clonar el repositorio
git clone https://github.com/galanteh/data360_credit_calculator.git
cd data360_credit_calculator

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173
```

---

## ☁️ Despliegue en Heroku

```bash
# Autenticarse en Heroku
heroku login

# Crear app (en cuenta personal o equipo)
heroku create data360-credit-calculator
# En cuenta corporativa Salesforce: heroku create data360-credit-calculator --team <nombre-equipo>

# Configurar remote y desplegar
git remote add heroku https://git.heroku.com/data360-credit-calculator.git
git push heroku main

# Abrir en el navegador
heroku open
```

> **Nota:** Las cuentas corporativas de Salesforce en Heroku requieren que la app pertenezca a un equipo. Usa `--team <nombre-equipo>` o despliega desde una cuenta personal de Heroku.

---

## 📁 Estructura del Proyecto

```
data360_credit_calculator/
├── src/
│   ├── engine/
│   │   └── calculatorEngine.ts   # Motor V3 — todas las fórmulas
│   ├── components/
│   │   ├── QuestionnaireForm.tsx  # Cuestionario 4 pasos
│   │   ├── ResultsDashboard.tsx   # Dashboard de créditos y ROI
│   │   ├── PDFExport.tsx          # Generador PDF ejecutivo (jsPDF)
│   │   ├── LogoUploader.tsx       # Componente drag & drop de logo
│   │   └── ProgressBar.tsx        # Barra de progreso
│   ├── types/index.ts             # Tipos TypeScript
│   └── data/industryDefaults.ts   # Defaults por industria y canales
├── server.js                      # Express SPA server (Heroku)
├── Procfile                       # Heroku process definition
├── vite.config.ts
└── tailwind.config.js
```

---

## 🧪 Caso de Prueba de Referencia (Datos de Ejemplo)

Para validar el motor de cálculo usa el botón **"🧪 Cargar Caso Demo"** en la barra superior:

| Parámetro | Valor |
|---|---|
| Industria | Retail |
| Perfiles (N) | 2,000,000 |
| Engagement | 9,000,000 |
| Daily Update | 10% |
| Lookback | 24 meses |
| Rulesets | 2 |
| Segmentos | 200 |
| Activaciones/año | 1,000 |
| Edición | Profiles & Flex (−15%) |

**Resultado esperado: ~11.17M créditos** *(referencia oficial Salesforce V3: ~11.27M)*

---

## ⚠️ Disclaimer

Esta es una estimación preliminar generada automáticamente con base en parámetros ingresados. Los resultados reales pueden variar según la arquitectura, calidad de datos y configuración específica. Se recomienda validar con el equipo de **Solution Engineering de Salesforce** antes de presentar propuestas formales.

---

*Salesforce Data 360 Credit Calculator © 2026*
