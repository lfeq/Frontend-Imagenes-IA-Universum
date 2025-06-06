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
    
## Pasos para Ejecutar la Aplicación en Desarrollo
  
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

4. **Iniciar la Aplicación en Modo Desarrollo**:
   - Ejecuta el siguiente comando:
     ```bash
     npm start
     ```
   - Esto abrirá la aplicación en tu navegador en `http://localhost:3000`.

## Compilación y Despliegue en Producción

### Para Servidores Linux

1. **Compilar el Proyecto**:
   ```bash
   npm run build
   ```
   Esto creará una carpeta `dist` con los archivos optimizados para producción.

### Para Windows
El proceso es similar al de Linux:

1. **Compilar el Proyecto**:
   ```bash
   npm run build
   ```

2. **Instalar serve globalmente**:
   ```bash
   npm install -g serve
   ```

3. **Iniciar el servidor**:
   ```bash
   serve -s dist
   ```

### Notas para Producción
- Para cambiar el puerto por defecto, puedes usar la opción `-l` o `--listen`:
  ```bash
  serve -s dist -l 4000
  ```
- Asegúrate de actualizar las URLs en `src/config.js` para que apunten a tu servidor de producción.
- Se recomienda usar un servidor web como Nginx o Apache en producción para mejor rendimiento y seguridad.

## Rutas Principales
- `/imagenes`: Muestra la galería de imágenes generadas.
- `/nota`: Permite crear una nueva nota.
- `/galeria-carrusel`: Muestra un carrusel rotatorio de imágenes.
- `/`: Página de inicio.

## Servidor GraphQL
- Asegúrate de que el servidor GraphQL esté configurado correctamente y responda a las consultas y mutaciones necesarias.