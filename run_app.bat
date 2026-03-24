@echo off
echo ==============================
echo Iniciando proyecto Quasar...
echo ==============================

REM Ir a la carpeta del proyecto
cd /d %~dp0

REM Abrir VS Code SIN bloquear el script
start "" code .

REM Ejecutar Quasar Dev
call quasar dev

pause