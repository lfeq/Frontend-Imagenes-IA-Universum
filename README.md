# Aplicación de Visualizaciones Futuras
  
  ## Requisitos
  
  1. **Sistema Operativo**: Windows, macOS o Linux.
  2. **Node.js**: Versión 16 o superior.
     - Descárgalo desde [Node.js](https://nodejs.org/).
  3. **npm**: Incluido con Node.js.
  4. **Dependencias del Proyecto**:
     - React
     - React Router DOM
     - Otras dependencias especificadas en el archivo `package.json`.
  
  ## Pasos para Ejecutar la Aplicación
  
  1. **Clonar el Repositorio**:
     - Abre una terminal y ejecuta:
       ```bash
       git clone https://github.com/lfeq/Frontend-Imagenes-IA-Universum.git
       cd Frontend-Imagenes-IA-Universum
       ```
  
  2. **Instalar Dependencias**:
     - Ejecuta el siguiente comando en la raíz del proyecto:
       ```bash
       npm install
       ```
  
  3. **Configurar la API**:
     - Asegúrate de que el servidor GraphQL esté corriendo en la URL especificada en `src/config.js`:
       - `API_URL`: `http://192.168.1.105:5000/graphql/`
       - `IMAGES_URL`: `http://192.168.1.105:5000/`
     - Si es necesario, actualiza estas URLs en el archivo `src/config.js`.
  
  4. **Iniciar la Aplicación**:
     - Ejecuta el siguiente comando:
       ```bash
       npm start
       ```
     - Esto abrirá la aplicación en tu navegador en `http://localhost:3000`.
  
  5. **Verificar las Rutas Principales**:
     - `/imagenes`: Muestra la galería de imágenes generadas.
     - `/nota`: Permite crear una nueva nota.
     - `/galeria-carrusel`: Muestra un carrusel rotatorio de imágenes.
     - `/`: Página de inicio.
  
  6. **Servidor GraphQL**:
     - Asegúrate de que el servidor GraphQL esté configurado correctamente y responda a las consultas y mutaciones necesarias.
  
  ## Notas Adicionales
  
  - Para cambiar el puerto por defecto (3000), usa:
    ```bash
    PORT=4000 npm start