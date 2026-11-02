# Recursos prácticos de Samuel Acuña

Herramientas, skills y guías para convertir procesos comerciales en operaciones revisables.

## Mesa de seguimiento

[Usar la herramienta](https://samuelacuna12.github.io/recursos-automatizacion/) · [Guía PDF](downloads/guia-seguimiento.pdf) · [Skill descargable](downloads/seguimiento-cotizaciones.zip)

Clasifica un CSV de cotizaciones en vencidas, para hoy, agendadas, por definir, datos por revisar, excluidas y cerradas. La lectura del archivo ocurre en el navegador; no hay backend, analítica ni subida del CSV. Cerrar la página elimina los datos cargados. GitHub recibe las peticiones normales para servir los archivos del sitio.

El sistema aplica reglas transparentes: no es un modelo de IA, no envía mensajes, no comprueba pagos y no cambia tu CRM. La skill complementaria permite trabajar con un asistente y contexto real.

### Usar la skill

Descarga el ZIP y extrae `seguimiento-cotizaciones` en la carpeta de skills de tu asistente compatible. En Codex, usa `~/.codex/skills/seguimiento-cotizaciones/`. Reinicia o recarga el catálogo si tu aplicación lo requiere. También puedes compartir el SKILL.md con tu asistente como instrucciones, sin afirmar que quedó instalada.

Ejemplo de pedido: «Revisa este CSV con seguimiento-cotizaciones usando 2026-11-02 como fecha. No envíes mensajes. Separa bajas, duplicados y próximas acciones por confirmar».

### Probar el código

No necesita instalación. Sirve la carpeta con `python3 -m http.server 8080` y abre `http://localhost:8080`. Ejecuta `node --test tests/core.test.mjs` para comprobar clasificación, CSV y exportación.

Los registros de ejemplo son ficticios. La prioridad calculada no demuestra intención de compra ni autorización de contacto.

### Referencias

- [File API, MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications): lectura local de archivos seleccionados por el usuario.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): publicación del sistema estático.

Código y textos propios: Samuel Acuña. Uso permitido bajo licencia MIT.
