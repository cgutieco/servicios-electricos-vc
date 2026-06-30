# Servicios Eléctricos VC - Landing Page

Sitio web oficial (landing page) de **Servicios Eléctricos VC**, una empresa especializada en mantenimiento
electromecánico y eléctrico de confianza para condominios y edificios.

El proyecto está desarrollado con **Astro** y **Tailwind CSS v4**, diseñado para ser extremadamente rápido, accesible y
optimizado para SEO.

## 🚀 Características

- **Diseño Responsivo & Moderno:** Optimizado para dispositivos móviles, tablets y ordenadores de escritorio.
- **Sección de Servicios:** Detalle de servicios de mantenimiento electromecánico con tarjetas descriptivas.
- **Contacto Seguro (Anti-scraping):** Implementación de codificación en Base64 para el correo y el teléfono,
  decodificados progresivamente con JavaScript del lado del cliente para evitar que bots de spam extraigan los datos de
  contacto.
- **Botón Flotante de WhatsApp:** Acceso rápido para comunicación directa con la empresa.
- **Redes Sociales integradas:** Enlaces a Facebook, WhatsApp y LinkedIn del contratante.
- **Rendimiento Excelente:** Carga ultrarrápida gracias al pre-renderizado estático de Astro y la optimización de
  imágenes nativa.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Astro v7](https://astro.build/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Procesamiento de Imágenes:** [Sharp](https://github.com/lovell/sharp)
- **Gestor de paquetes:** `pnpm`

## 📁 Estructura del Proyecto

```text
/
├── public/               # Archivos públicos estáticos (favicons, etc.)
├── src/
│   ├── assets/           # Imágenes, íconos y otros recursos multimedia
│   ├── components/       # Componentes reutilizables de Astro (Hero, About, Services, etc.)
│   ├── layouts/          # Plantillas de diseño base (Layout.astro)
│   ├── pages/            # Páginas del sitio (index.astro)
│   └── styles/           # Configuración de estilos globales y CSS personalizado
├── astro.config.mjs      # Configuración de Astro y plugins
├── package.json          # Dependencias y scripts del proyecto
└── tsconfig.json         # Configuración de TypeScript
```

## ⚙️ Desarrollo Local

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd servicios-electricos-vc
   ```

2. **Instalar las dependencias:**
   ```bash
   pnpm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   El sitio estará disponible en `http://localhost:4321`.

## 📦 Compilación para Producción

Para generar el sitio estático optimizado listo para producción:

```bash
pnpm build
```

Los archivos resultantes se guardarán en la carpeta `/dist`, listos para ser desplegados en plataformas como Vercel,
Netlify, GitHub Pages, o cualquier servidor web estático.

Para previsualizar el sitio de producción localmente:

```bash
pnpm preview
```

## 👨‍💻 Créditos

Desarrollado con ❤️ para **Servicios Eléctricos VC**.
