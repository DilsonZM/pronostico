# ⚽ Pronóstico - Colombia vs Portugal

App web para pronósticos del partido **Colombia vs Portugal** - Amistoso Internacional 2026.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 6 |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth) + Vercel Serverless Functions |
| Datos en vivo | football-data.org API |
| Despliegue | Vercel |

## 📋 Funcionalidades

- ✅ Landing page con branding del partido
- ✅ Registro simple solo con nombre (auth anónima)
- ✅ Formulario de pronóstico con steppers
- ✅ Countdown timer en tiempo real
- ✅ Guardado/actualización de pronósticos
- ✅ Vista "Mi pronóstico" con animaciones
- ✅ Bloqueo automático por fecha
- ✅ Panel admin protegido con PIN
- ✅ Estadísticas (promedios, conteos)
- ✅ Ranking de participantes
- ✅ Resultado en vivo vía football-data.org
- ✅ Comparación automática pronóstico vs resultado real
- ✅ Sistema de puntos (3 pts exacto, 1 pt resultado)
- ✅ Auto-refresh cada 60s cuando el partido está en juego
- ✅ Diseño mobile-first premium
- ✅ Row Level Security en Supabase

## 🛠️ Instalación Local

```bash
# 1. Clonar el repo
git clone https://github.com/DilsonZM/pronostico.git
cd pronostico

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Ejecutar
npm run dev
```

## 🔧 Variables de Entorno

| Variable | Descripción |
|----------|------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon/publishable de Supabase |
| `VITE_ADMIN_PIN` | PIN para acceder al panel admin |
| `VITE_MATCH_DEADLINE` | Fecha límite en formato ISO 8601 |
| `FOOTBALL_DATA_API_KEY` | API key de football-data.org (solo servidor) |
| `FOOTBALL_DATA_COMPETITION_ID` | ID de competición (default: 2000 = Mundial) |

> ⚠️ `FOOTBALL_DATA_API_KEY` **nunca** se expone al cliente. Se usa solo en la serverless function `/api/live-match`.

## ⚽ Integración football-data.org

### Registro
1. Crea cuenta gratis en https://www.football-data.org/client/register
2. Recibirás un API key por email
3. Plan gratuito: 10 requests/minuto

### Arquitectura
```
Cliente React → /api/live-match (Vercel Serverless) → football-data.org
                            ↑
                     API key segura (server-side)
```

### Archivos de la integración
| Archivo | Descripción |
|---------|------------|
| `api/live-match.js` | Serverless function que consulta football-data.org |
| `src/lib/liveMatch.js` | Servicio frontend con caché y manejo de errores |
| `src/lib/compareScores.js` | Utilidad para comparar pronósticos vs resultado real |
| `src/hooks/useLiveMatch.js` | Hook React con polling automático |
| `src/components/ui/LiveMatchCard.jsx` | Componente visual del marcador en vivo |
| `src/components/ui/PredictionComparison.jsx` | Componente de comparación pronóstico vs real |

### Comportamiento
- **Partido programado**: Muestra fecha y estado
- **En juego**: Auto-refresh cada 60s, indicador rojo pulsante
- **Entretiempo**: Muestra marcador de primer tiempo
- **Finalizado**: Muestra resultado final + penales si aplica
- **Comparación**: 3 puntos por marcador exacto, 1 punto por resultado correcto

## 📦 Base de Datos (Supabase)

### Configuración

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre el SQL Editor
3. Copia y ejecuta el contenido de `supabase/schema.sql`

### Estructura

```sql
-- profiles: Usuarios con display_name
-- predictions: Pronósticos (user_id, colombia_score, portugal_score)
-- app_config: Configuración de la app (match info, deadline, branding)
```

### RLS Policies

- Cada usuario solo ve/edita su propio pronóstico
- Admin puede ver todos los pronósticos
- Configuración de app es lectura pública

## 🚀 Despliegue en Vercel

### Opción 1: CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Opción 2: GitHub Integration
1. Conecta el repo en [vercel.com](https://vercel.com)
2. Configura las variables de entorno
3. Vercel hace deploy automático en cada push

### Variables en Vercel
En tu proyecto de Vercel → Settings → Environment Variables, agrega:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PIN`
- `VITE_MATCH_DEADLINE`
- `FOOTBALL_DATA_API_KEY` ⚠️ Solo server-side
- `FOOTBALL_DATA_COMPETITION_ID` (opcional, default: 2000)

## 📁 Estructura del Proyecto

```
pronostico/
├── .env.example          # Variables de entorno de ejemplo
├── .env                  # Variables locales (no subir a git)
├── .gitignore
├── index.html            # Entry point HTML
├── package.json
├── vite.config.js        # Config de Vite
├── vercel.json           # Config de Vercel
├── api/
│   └── live-match.js     # Vercel Serverless Function (football-data.org)
├── supabase/
│   └── schema.sql        # SQL completo de la BD
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # Entry point React
    ├── App.jsx           # Router y layout principal
    ├── index.css          # Estilos globales + Tailwind
    ├── lib/
    │   ├── supabase.js      # Cliente Supabase + config
    │   ├── liveMatch.js     # Servicio football-data.org (frontend)
    │   └── compareScores.js # Comparación pronóstico vs resultado
    ├── hooks/
    │   └── useLiveMatch.js  # Hook polling datos en vivo
    ├── context/
    │   ├── AuthContext.jsx     # Auth provider
    │   └── PredictionContext.jsx # Predictions provider
    ├── components/
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── ScoreStepper.jsx
    │   │   ├── CountdownTimer.jsx
    │   │   ├── MatchCard.jsx
    │   │   ├── LoadingScreen.jsx
    │   │   ├── LiveMatchCard.jsx
    │   │   └── PredictionComparison.jsx
    │   └── layout/
    │       ├── Header.jsx
    │       └── Footer.jsx
    └── pages/
        ├── Landing.jsx
        ├── Login.jsx
        ├── Prediction.jsx
        ├── MyPrediction.jsx
        └── Admin.jsx
```

## 🔒 Seguridad

- **Auth anónima** de Supabase: cada usuario tiene un UUID único
- **Row Level Security**: cada usuario solo accede a sus datos
- **Admin protegido** con PIN configurable
- **Validaciones** en frontend y backend (CHECK constraints)
- **Deadline automático**: bloqueo por fecha

## ⚡ Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## 📄 Licencia

MIT
