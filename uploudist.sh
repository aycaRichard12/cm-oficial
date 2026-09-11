#!/bin/bash

# Detener el script si hay errores dentro de comandos críticos
# No usamos set -e porque queremos volver al menú cuando algo falle.

# Ir al directorio donde está este script
cd "$(dirname "$0")" || exit 1

while true; do

    clear

    echo "==========================================="
    echo "      GESTOR DE DESPLIEGUE QUASAR + API"
    echo "==========================================="
    echo "  1. [Todo] Clean + Build + Limpiar + Subir (SPA + API)"
    echo "  2. [Build] Quasar Clean + Quasar Build"
    echo "  3. [Limpiar] Solo borrar Assets en Servidor"
    echo "  4. [Subir] Solo subir carpeta dist/spa"
    echo "  5. [Limpiar Dist] Limpiar carpeta dist local"
    echo "  6. Salir"
    echo "==========================================="

    read -p "Seleccione una opcion (1-6): " opcion

    case "$opcion" in

        1)
            echo
            echo "🔹 Iniciando proceso completo (Frontend + API)..."
            echo

            echo "🔹 Ejecutando Quasar Clean..."
            if ! npx quasar clean; then
                echo
                echo "❌ Error ejecutando Quasar Clean."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "🔹 Ejecutando Quasar Build PWA..."
            if ! npx quasar build -m pwa; then
                echo
                echo "❌ Error ejecutando Quasar Build."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "🔸 Limpiando assets antiguos..."
            if ! python3 pyLimpiarCarpetaAssets.py; then
                echo
                echo "❌ Error limpiando assets del servidor."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "🔸 Subiendo Frontend (SPA)..."
            if ! python3 pySubirDistAlServidor.py; then
                echo
                echo "❌ Error subiendo Frontend."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "==========================================="
            echo "✅ Proceso completo terminado correctamente"
            echo "==========================================="

            read -p "Presione ENTER para volver al menu..."
            ;;

        2)
            echo
            echo "🔹 Ejecutando Quasar Clean y Build..."
            echo

            if ! npx quasar clean; then
                echo
                echo "❌ Error ejecutando Quasar Clean."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            if ! npx quasar build -m pwa; then
                echo
                echo "❌ Error ejecutando Quasar Build."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "==========================================="
            echo "✅ Build completado con exito."
            echo "==========================================="

            read -p "Presione ENTER para volver al menu..."
            ;;

        3)
            echo
            echo "🔹 Limpiando carpeta assets en el servidor..."
            echo

            if ! python3 pyLimpiarCarpetaAssets.py; then
                echo
                echo "❌ Error limpiando assets."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "✅ Assets limpiados correctamente."

            read -p "Presione ENTER para volver al menu..."
            ;;

        4)
            echo
            echo "🔹 Subiendo archivos de dist/spa al servidor..."
            echo

            if ! python3 pySubirDistAlServidor.py; then
                echo
                echo "❌ Error subiendo archivos."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "✅ Archivos subidos correctamente."

            read -p "Presione ENTER para volver al menu..."
            ;;

        5)
            echo
            echo "🔹 Limpiando carpeta dist local..."
            echo

            if ! npx quasar clean; then
                echo
                echo "❌ Error limpiando carpeta dist."
                read -p "Presione ENTER para continuar..."
                continue
            fi

            echo
            echo "✅ Carpeta dist limpiada correctamente."

            read -p "Presione ENTER para volver al menu..."
            ;;

        6)
            echo
            echo "👋 Saliendo..."
            exit 0
            ;;

        *)
            echo
            echo "❌ Opcion no valida."
            echo
            read -p "Presione ENTER para continuar..."
            ;;

    esac

done