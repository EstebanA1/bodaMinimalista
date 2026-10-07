@echo off
cd /d "%~dp0"
echo Vista previa local: http://localhost:4173
echo Deja abierta esta ventana mientras uses la invitacion. Pulsa Ctrl+C para detener el servidor.
py -3 -m http.server 4173 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo No se pudo iniciar Python. Instala Python 3 o ejecuta: python -m http.server 4173 --bind 127.0.0.1
  pause
)
