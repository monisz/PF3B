# PF3B
TERCERA PREENTREGA PROYECTO FINAL BACKEND - CODERHOUSE

(Español)
La aplicación puede iniciar con node o nodemon server
parámetros opcionales por línea de comando:
- mode: cluster, por default fork
- port: por default 8080

Variables de entorno:
para Windows: >set VARIABLE=valor
- NODE_ENV: setear en PROD para producción (por ahora solo lo utiliza el logger). Si no se setea PROD queda como desarrollo
- ADMIN: =true para entrar en modo administrador y poder realizar cambios en el listado de productos
- CLUSTER: para entrar en modo cluster desde variable de entorno


(English)
The application can start with node or nodemon server
optional parameters per command line:
- mode: cluster, default fork
- port: default 8080

Environment Variables:
for Windows: >set VARIABLE=value
- NODE_ENV: set to PROD for production (for now only used by the logger). If PROD is not set, it remains as development
- ADMIN: =true to enter administrator mode and be able to make changes to the product list
- CLUSTER: to enter cluster mode from environment variable
