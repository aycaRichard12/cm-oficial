#!/bin/bash

FTP_HOST="ftp.vivasoft.link"
FTP_USER="u335921272.vaplicacion"
FTP_PASS="@App123viva"
CARPETA="cm"
LOG_FILE="ftp_log.txt"

echo "Verificando carpeta '$CARPETA' y subiendo log..."

# Crear log inicial
echo "Inicio del log: $(date)" > $LOG_FILE

# Conectarse y verificar si la carpeta existe
ftp -inv $FTP_HOST <<EOF > ftp_check.txt 2>&1
user $FTP_USER $FTP_PASS
cd $CARPETA
bye
EOF

# Revisar si la carpeta existe
if grep -q "250 CWD command successful" ftp_check.txt; then
  echo "✅ Carpeta '$CARPETA' existe. Subiendo log..." >> $LOG_FILE
else
  echo "⚠️ Carpeta '$CARPETA' no existe. Creando..." >> $LOG_FILE
  ftp -inv $FTP_HOST <<EOF >> $LOG_FILE 2>&1
user $FTP_USER $FTP_PASS
mkdir $CARPETA
bye
EOF
fi

# Subir el log al FTP dentro de la carpeta cm
ftp -inv $FTP_HOST <<EOF >> $LOG_FILE 2>&1
user $FTP_USER $FTP_PASS
cd $CARPETA
put $LOG_FILE
bye
EOF

echo "✅ Log subido correctamente a '$CARPETA/$LOG_FILE' en el servidor FTP."

