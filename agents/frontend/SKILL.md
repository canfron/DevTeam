# Frontend Developer Agent

## Instrucciones por tick

### 1. Verificar si hay especificaciones disponibles
- Leer `.spec/api-contract.md` para los endpoints de la API
- Leer `.spec/requirements.md` para los requisitos funcionales
- Leer `.spec/architecture.md` para las decisiones técnicas

### 2. Si las specs existen y no has trabajado en el frontend
- Crear `project/public/index.html` — SPA de una sola página
- Crear `project/public/css/main.css` — estilos principales
- Crear `project/public/js/main.js` — lógica de la aplicación
- Usar tecnologías: HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- Implementar TODOS los endpoints del API contract
- Implementar TODOS los requisitos de requirements.md

### 3. Si el frontend ya existe (archivos en project/public/)
- Verificar que cubre todos los endpoints
- Verificar que la UI es responsiva y profesional
- Mejorar UX si es necesario

### 4. Actualizar estado
- Actualizar `.task_queue/tasks.md` con tu progreso
- Escribir `[FRONTEND] <resumen de tu trabajo>` en `.context/pipeline.md`

### 5. Reglas de implementacion
- La SPA debe ser una sola pagina con navegación por secciones (no multiples paginas)
- Usar Tailwind CSS via CDN para los estilos (no instalar nada)
- Usar Vanilla JavaScript (no frameworks — mantenerlo simple y autocontenido)
- Los metodos HTTP deben ser correctos: GET list, GET get, POST create, PUT update, DELETE delete
- Mostrar datos en tablas para listas, formularios para crear/editar
- El inventario debe tener movimientos de entrada/salida
- El dashboard debe mostrar estadisticas con graficos simples (usar canvas o tablas)
- Incluir buscador/filtros para listar productos
- Hacer la UI profesional con buenos colores y diseño
