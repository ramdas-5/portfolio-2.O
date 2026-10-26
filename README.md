# ⚡ Ramdas Hembram — 3D Interactive Portfolio (v2.0)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14-black?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-black)](https://lenis.darkroom.engineering/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

An immersive, high-performance personal portfolio built for **Ramdas Hembram** — Full Stack Web Developer & Computer Science Student based in Kolkata, India. Featuring real-time **WebGL2 GPGPU liquid particle physics**, **Three.js verlet physics simulations**, **3D perspective transforms**, **D3.js geospatial globe visualization**, and **Lenis smooth inertia scrolling**.

---

## 🌟 Highlights & Key Features

### 🌊 1. WebGL2 GPGPU Liquid Particle Hero
- **Interactive Fluid Physics**: The hero visualizes over **100,000 GPU-simulated particles** sampled directly from source pixels.
- **Dynamic Cursor Disturbance**: Moving the pointer liquefies the particles with realistic velocity, turbulence, and displacement before smoothly returning to rest position.
- **Graceful Fallback**: Automatically degrades to a crisp static render on devices without WebGL2 support.

### 🌐 2. Interactive Kinetic Grid Background
- **Procedural Canvas Lattice**: A custom 2D canvas grid with responsive node elasticity and mouse-proximity warping.
- **Interactive Ripples**: Click and motion pulses create ripple waves across the background plane without blocking foreground layout.

### 💻 3. True-3D Macbook Scroll Experience
- **Perspective Camera Unfolding**: A custom 3D model of a MacBook rendered from a steep top-down angle (~70° camera pitch).
- **Synchronized Scroll Timeline**: As you scroll through the *Professional Experience* section, the experience card docks onto the Retina display, tilts upright to face the viewer, and scales up seamlessly while the laptop deck recedes.
- **Physics-Based Lanyard ID Badge**: A live **Three.js verlet physics simulation** featuring gravity, damping, strap breeze, and interactive mouse-drag mechanics for the ID badge.

### 🎡 4. 3D Cylindrical "Works Wheel" Carousel
- **Rotary Drum Navigation**: A 3D perspective rotary wheel for browsing certifications and resume credentials.
- **Multi-Input Controls**: Supports mouse wheel scrolling, touch drags, and arrow keys with friction physics and snap stops.
- **Image Lightbox**: Clickable zoom viewer with smooth pop-out animations and blurred scrim backdrop.

### 🗂️ 5. Sticky Stacking Projects & Spotlight Cards
- **ScrollStack Architecture**: Project cards pin and stack sequentially with depth dimming and vertical scaling.
- **Chroma Spotlight Reveal**: Cards render in high-contrast monochrome until an interactive mouse spotlight mask reveals full vibrant colors and luminous borders.

### 🌍 6. D3.js + TopoJSON Interactive World Globe
- **Orthographic Geospatial Rendering**: Vector-rendered globe displaying world landmass boundaries.
- **Live Location Beacon**: Auto-rotating earth projection with an interactive pulsing marker pinned on **Kolkata, West Bengal, India**.
- **Interactive Drag & Spin**: Full drag-to-rotate interaction with friction inertia.

### 🎯 7. Custom Spring Target Cursor & Ambience
- **Spring Physics Reticle**: Custom target reticle with dynamic corner expansion, spinning states on interactables, and contrast-preserving halo drop shadows.
- **Gradual Blur Viewport Scrims**: Exponential multi-layered blur gradients at the top and bottom of the viewport for smooth visual transitions.
- **Gooey Nav & Floating Dock**: Liquid particle-burst desktop navigation paired with a macOS-style magnifying floating quick dock.

---

## 🛠️ Tech Stack & Architecture

### **Core Framework & Build Tool**
| Technology | Description |
|---|---|
| **[React 19](https://react.dev/)** | Modern component architecture, hooks, and concurrent rendering |
| **[Vite 7](https://vite.dev/)** | Next-generation frontend tooling with lightning-fast HMR and Rollup bundling |
| **[TypeScript](https://www.typescriptlang.org/)** & **JSX** | Strictly typed component interfaces and robust type safety |

### **Styling & Design System**
| Technology | Description |
|---|---|
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Next-generation utility-first CSS framework with native `@theme` CSS tokens |
| **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** | Conflict-free dynamic className composition |
| **Geist & Inter Typography** | Clean, modern sans-serif typographic hierarchy |

### **3D Graphics, Shaders & Data Visualization**
| Technology | Description |
|---|---|
| **[Three.js](https://threejs.org/)** | WebGL 3D rendering for verlet physics lanyard and custom geometry |
| **WebGL2 GPGPU** | GPU-accelerated liquid particle physics simulation (~100k particles) |
| **[D3.js (d3-geo)](https://d3js.org/)** & **[TopoJSON Client](https://github.com/topojson/topojson-client)** | Orthographic world projection and geospatial rendering |

### **Animation & Smooth Scrolling**
| Technology | Description |
|---|---|
| **[Framer Motion / Motion](https://motion.dev/)** | Declarative layout animations, 3D transforms, and scroll-linked values |
| **[GSAP 3](https://greensock.com/gsap/)** & **ScrollTrigger** | Precise timeline-based character split text reveals and scroll scrub triggers |
| **[Lenis](https://lenis.darkroom.engineering/)** | Buttery smooth momentum scrolling with reduced-motion accessibility |

### **Icons & Primitives**
| Technology | Description |
|---|---|
| **[Lucide React](https://lucide.dev/)** | Crisp, consistent system icons |
| **[Tabler Icons](https://tabler.io/icons)** | Navigation and dock glyphs |
| **[React Icons](https://react-icons.github.io/react-icons/)** | Brand and technology logos |
| **[Radix UI](https://www.radix-ui.com/)** | Accessible unstyled primitive components |

---

## 📁 Project Directory Structure

```text
portfolio _me/
├── public/                       # Static public assets
├── src/
│   ├── components/               # UI components & interactive stages
│   │   ├── assest/               # Profile images, logos, certificates
│   │   │   ├── about-side-image.png
│   │   │   ├── Advance_Python.png
│   │   │   ├── Confident South Asian Portrait on Stage.png
│   │   │   ├── fleetralogo.png
│   │   │   ├── Mern.png
│   │   │   ├── Networking_Basics.png
│   │   │   └── Studio Portrait of a Bearded Man.png
│   │   ├── animated-3d-card.tsx      # 3D tilt perspective skill cards
│   │   ├── bg.tsx                    # Interactive KineticGrid canvas background
│   │   ├── border-beam.tsx           # Animated border beam glow effect
│   │   ├── CardSpotlight.tsx         # Shader dot-matrix spotlight cards
│   │   ├── cascade-text.tsx          # Masked headline reveal component
│   │   ├── ChromaGrid.tsx            # Radial spotlight mask grid effect
│   │   ├── contact-with-globe.tsx    # D3 orthographic earth globe & contact form
│   │   ├── DomeGallery.tsx           # Dome gallery projection viewer
│   │   ├── floating-dock.tsx         # macOS-style magnifying bottom navigation
│   │   ├── GooeyNav.tsx              # Liquid particle-burst header navigation
│   │   ├── GradualBlur.tsx           # Multi-layered gradual blur scrims
│   │   ├── hover-glow-button.tsx     # Radial hover glow button component
│   │   ├── image-lightbox.tsx        # High-res popup modal image lightbox
│   │   ├── Lanyard.tsx               # Three.js verlet physics draggable ID lanyard
│   │   ├── liquid-sculpture-hero.tsx # WebGL2 GPGPU 100k-particle liquid hero
│   │   ├── logoloop.tsx              # Infinite scrolling tech icon marquee
│   │   ├── macbook-experience.tsx    # True-3D perspective MacBook scroll stage
│   │   ├── macbook-scroll.tsx        # MacBook 3D keyboard & chassis models
│   │   ├── marquee.tsx               # Multi-directional marquee tracks
│   │   ├── ScrollReveal.tsx          # GSAP scroll-triggered text rise reveals
│   │   ├── ScrollStack.tsx           # Sticky stacking scroll container
│   │   ├── splittext.tsx             # GSAP char/word/line split animation
│   │   ├── spotlight-card.tsx        # Monochrome-to-color spotlight project card
│   │   ├── targetcursor.tsx          # Custom animated spring target reticle cursor
│   │   ├── techtext.tsx              # Monospace terminal typewriter effect
│   │   ├── text-gradient-scroll.tsx  # Scroll-linked gradient text illumination
│   │   ├── tilt-card.tsx             # Gyroscopic / pointer 3D tilt card
│   │   ├── timeline.tsx              # Academic milestone timeline component
│   │   └── works-wheel.tsx           # 3D cylindrical rotary carousel
│   ├── lib/
│   │   └── utils.ts                  # cn (clsx + tailwind-merge) utility
│   ├── App.jsx                       # Main page layout & section composition
│   ├── index.css                     # Tailwind v4 import, font tokens & keyframes
│   └── main.jsx                      # React 19 root & Lenis smooth scroll setup
├── .env.example                      # Sample environment variables
├── components.json                   # UI component registry configuration
├── index.html                        # HTML entry point with metadata & favicon
├── package.json                      # Project dependencies & npm scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── vercel.json                       # Vercel SPA client-side rewrite rules
└── vite.config.js                    # Vite plugins, aliases (@), and watch rules
```

---

## 🚀 Projects Showcased

1. **[Fleetra](https://fleetra.xo.je)** ([GitHub](https://github.com/ramdas-5/Fleetra))
   - *Smart Bus & Transport Management System*
   - Built with pure PHP, MySQL, Bootstrap 5, and vanilla JavaScript without heavy frameworks or build steps.
   - Features real-time vehicle dispatching, passenger ticketing, schedule tables, and administrative controls.

2. **[Yumlytic](https://recipe-finder-1-8z3b.onrender.com/)** ([GitHub](https://github.com/ramdas-5/Yumlytic))
   - *Recipe Discovery Web Application*
   - Full-stack MERN application (MongoDB, Express, React, Node.js) with JWT user authentication, ingredient-based search queries, and dynamic recipe curation.

3. **[File Server](https://github.com/ramdas-5/File-Server)**
   - *Java File Management System*
   - Backend file repository implementing structured REST APIs for secure file upload, retrieval, metadata inspection, and streaming download.

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (v9+), **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ramdas-5/portfolio-2.O.git
   cd "portfolio _me"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* If you want to use Web3Forms instead of FormSubmit for contact inquiries:
   ```env
   VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready artifacts will be bundled into the `dist/` directory.

6. **Preview production build locally**:
   ```bash
   npm run preview
   ```

> [!TIP]
> **Windows PowerShell Users**: If you encounter `PSSecurityException` regarding script execution, run scripts using `npm.cmd` (e.g. `npm.cmd run dev` or `npm.cmd run build`) or configure your PowerShell execution policy via `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

---

## 🚢 Deployment

The project is pre-configured for one-click deployment on **[Vercel](https://vercel.com/)**:

- **SPA Rewrites**: `vercel.json` contains route rewrites mapping all incoming requests back to `/index.html`.
- **Static Asset Serving**: Vite bundles static images and compiled JS/CSS with content hashing for optimal CDN caching.
- **Dynamic Assets**: The resume document is hosted via Cloudinary CDN to allow continuous updates without requiring full repository rebuilds.

---

## ♿ Accessibility & Performance

- **Reduced Motion Support**: Respects OS-level `prefers-reduced-motion: reduce` by disabling smooth scrolling in Lenis, locking particle velocity, and setting instant CSS transitions.
- **Hardware Acceleration**: Heavy transformations utilize CSS 3D matrix transforms and GPU-buffered WebGL render targets.
- **Contrast Protection**: Dynamic halo shadows around cursor elements and accessible text contrast across dark surfaces.

---

## 👤 Author & Contact

**Ramdas Hembram**  
*Computer Science & Engineering Student | Full Stack Web Developer*  
📍 Kolkata, West Bengal, India

- 🌐 **Portfolio**: [portfolio-2-o-eight.vercel.app](https://portfolio-2-o-eight.vercel.app) *(or live deployment)*
- ✉️ **Email**: [ramdashembram05@gmail.com](mailto:ramdashembram05@gmail.com)
- 💼 **LinkedIn**: [linkedin.com/in/dev-ramdas](https://www.linkedin.com/in/dev-ramdas)
- 🐙 **GitHub**: [@ramdas-5](https://github.com/ramdas-5)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
Feel free to explore the code, learn from the shader implementations, and use it as inspiration for your own creative development journey!
