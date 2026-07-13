import os
import re

# Configuración
directorio_raiz = './src'  # Cambia esto por la ruta de tu carpeta src
archivo_salida = 'lista_titulos.txt'
# Regex para buscar <div class="titulo"> Contenido </div>
# Si tus etiquetas varían (ej. span, h1), ajusta el patrón
patron = re.compile(r'<div class="titulo">([^<]+)</div>', re.IGNORECASE)

def extraer_titulos():
    with open(archivo_salida, 'w', encoding='utf-8') as f_out:
        f_out.write("Archivo | Contenido del Título\n")
        f_out.write("-" * 50 + "\n")
        
        # Recorrer directorios
        for root, dirs, files in os.walk(directorio_raiz):
            for file in files:
                if file.endswith('.vue'):
                    ruta_completa = os.path.join(root, file)
                    
                    try:
                        with open(ruta_completa, 'r', encoding='utf-8') as f_in:
                            contenido = f_in.read()
                            coincidencias = patron.findall(contenido)
                            
                            for titulo in coincidencias:
                                # Limpieza de espacios extra
                                titulo_limpio = titulo.strip()
                                f_out.write(f"{ruta_completa} -> {titulo_limpio}\n")
                    except Exception as e:
                        print(f"Error al leer {ruta_completa}: {e}")

    print(f"Proceso finalizado. Resultados guardados en {archivo_salida}")

if __name__ == "__main__":
    extraer_titulos()