# Grupli architecture

Grupli está organizado para que la interfaz, la lógica de producto y Supabase no estén mezclados.

## Capas

- `App.tsx`: router mínimo y composición general.
- `src/context/AppContext.tsx`: estado global, sesión, navegación y acciones de producto.
- `src/services/supabase.ts`: creación segura del cliente de Supabase.
- `src/services/repository.ts`: única capa que habla con tablas/RPC de Supabase.
- `src/domain/types.ts`: tipos de dominio compartidos.
- `src/theme/tokens.ts`: colores, tipografías, radios, sombras y espaciados.
- `src/components/*`: sistema visual reusable.
- `src/screens/*`: pantallas finales, usando componentes y acciones del contexto.
- `src/utils/*`: cálculos puros de fechas, dinero y torneos.
- `supabase/all_in_one.sql`: reset completo + schema + RLS + funciones.

## Regla de trabajo

No modificar pantallas saltándose el diseño base. Primero se crea/actualiza componente en `components`, luego se usa en pantalla. Así evitamos romper estilos pantalla por pantalla.

## Datos

No hay demo local. La app usa Supabase real. Si faltan variables de entorno, la pantalla inicial avisa.

Variables necesarias:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Deploy web

Vercel debe usar:

- Framework: Other
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## APK

El archivo `eas.json` deja preparado el perfil `preview` para generar APK instalable en Android.
