import os
from ftplib import FTP

# --- CONFIGURACIÓN DESDE VARIABLES DE ENTORNO ---

FTP_HOST = os.environ["FTP_SERVER"]
FTP_USER = os.environ["FTP_USERNAME"]
FTP_PASS = os.environ["FTP_PASSWORD"]
REMOTE_DIR = os.environ["FTP_TARGET_DIR"]

# Ruta local: dist/pwa
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DIR = os.path.join(BASE_DIR, "dist", "pwa")


def upload_recursive(ftp, local_path):
    """
    Sube archivos y carpetas manteniendo la estructura.
    """

    for item in os.listdir(local_path):

        local_item_path = os.path.join(local_path, item)

        if os.path.isfile(local_item_path):

            with open(local_item_path, "rb") as f:
                ftp.storbinary(f"STOR {item}", f)

            print(f"  [ARCHIVO] -> {item}")

        elif os.path.isdir(local_item_path):

            try:
                ftp.mkd(item)
            except:
                pass

            ftp.cwd(item)

            upload_recursive(
                ftp,
                local_item_path
            )

            ftp.cwd("..")


def main():

    if not os.path.exists(LOCAL_DIR):

        print(
            f"❌ ERROR: No se encontró la carpeta: {LOCAL_DIR}"
        )

        print(
            "Asegúrate de ejecutar "
            "'quasar build -m pwa' antes."
        )

        return 1

    print("--- 🚀 INICIANDO DESPLIEGUE ---")
    print(f"📂 Origen: {LOCAL_DIR}")
    print(f"🌐 Destino: {REMOTE_DIR}")

    try:

        print(
            f"\n🔗 Conectando a {FTP_HOST}..."
        )

        with FTP(
            FTP_HOST,
            FTP_USER,
            FTP_PASS
        ) as ftp:

            ftp.cwd(REMOTE_DIR)

            print(
                "✅ Conectado. "
                "Subiendo archivos...\n"
            )

            upload_recursive(
                ftp,
                LOCAL_DIR
            )

            print(
                "\n✨ ¡PROCESO COMPLETADO!"
            )

            return 0

    except Exception as e:

        print(
            f"\n❌ ERROR CRÍTICO: {e}"
        )

        return 1


if __name__ == "__main__":
    raise SystemExit(main())