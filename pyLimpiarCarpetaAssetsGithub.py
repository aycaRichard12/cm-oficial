import os
from ftplib import FTP

# --- CONFIGURACIÓN DESDE VARIABLES DE ENTORNO ---

FTP_HOST = os.environ["FTP_SERVER"]
FTP_USER = os.environ["FTP_USERNAME"]
FTP_PASS = os.environ["FTP_PASSWORD"]
REMOTE_DIR = os.environ["FTP_TARGET_DIR"]


def borrar_recursivo(ftp, carpeta):
    """
    Función para borrar carpetas y archivos de forma recursiva en FTP.
    """
    try:
        ftp.cwd(carpeta)
        items = ftp.nlst()

        for item in items:
            if item in [".", ".."]:
                continue

            try:
                ftp.delete(item)
                print(f"  🗑️ Archivo borrado: {item}")
            except:
                borrar_recursivo(ftp, item)

        ftp.cwd("..")
        ftp.rmd(carpeta)
        print(f"✅ Carpeta eliminada: {carpeta}")

    except Exception as e:
        print(f"⚠️ No se pudo borrar {carpeta}: {e}")


def limpiar_servidor():
    print("--- 🧹 INICIANDO LIMPIEZA DE ASSETS ---")

    try:
        with FTP(FTP_HOST, FTP_USER, FTP_PASS) as ftp:
            ftp.cwd(REMOTE_DIR)

            archivos_raiz = ftp.nlst()

            if "assets" in archivos_raiz:
                print("📂 Carpeta 'assets' encontrada. Eliminando...")
                borrar_recursivo(ftp, "assets")
            else:
                print("∅ No se encontró la carpeta 'assets', nada que limpiar.")

            print("\n✨ Limpieza terminada.")

    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")


if __name__ == "__main__":
    limpiar_servidor()