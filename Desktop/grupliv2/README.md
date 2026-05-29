# Grupli

App mobile-first para organizar grupos reales: quedadas, asistencia, finanzas, miembros, torneos y resultados.

## Instalar en Windows

```powershell
cd "$env:USERPROFILE\Desktop\grupliv2"
npm install
npm run build
```

## Ejecutar local

```powershell
cd "$env:USERPROFILE\Desktop\grupliv2"
npm run web
```

## Subir a GitHub

```powershell
cd "$env:USERPROFILE\Desktop\grupliv2"

git init
git branch -M main

git config user.name "Jose Rubio"
git config user.email "joseruyca@gmail.com"

git remote remove origin 2>$null
git remote add origin https://github.com/joseruyca/grupli.git

git add .
git commit -m "Rebuild Grupli product UI"
git push -u origin main --force
```

## Supabase

Ejecutar en Supabase SQL Editor:

```text
supabase/all_in_one.sql
```

Añadir variables en local y Vercel:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_KEY_PUBLICA
```

## Vercel

```text
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## APK Android

```powershell
cd "$env:USERPROFILE\Desktop\grupliv2"
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build -p android --profile preview
```
