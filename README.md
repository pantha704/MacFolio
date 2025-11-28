# MacFolio

A pixel-perfect, browser-based recreation of the macOS experience. Built with React, TypeScript, and Vite to demonstrate advanced frontend engineering capabilities.

![MacFolio Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## Overview

MacFolio is more than just a portfolio; it's an immersive operating system simulation running entirely in the browser. It features a fully functional window management system, a dynamic dock, and a suite of integrated applications that mirror their native counterparts.

## Key Features

- **Desktop Environment**:

  - **Window Management**: Draggable, resizable, and stackable windows with z-index handling.
  - **Dock**: Interactive dock with magnification effects and app launching.
  - **Menu Bar**: Functional clock, control center, and system menus.
  - **Wallpaper Engine**: Set any image from the Gallery as your desktop background with a single click.

- **Integrated Applications**:

  - **Finder**: Navigate a virtual file system with support for nested folders and file previews.
  - **Safari**: A functional browser simulation for viewing project demos and articles.
  - **Gallery**: Browse photos, manage favorites, and customize your wallpaper.
  - **Terminal**: A fully interactive terminal emulator (xterm.js) with custom commands.
  - **Contact**: A sleek, animated card for professional outreach.

- **Technical Highlights**:
  - **Performance**: Built on Vite for lightning-fast HMR and production builds.
  - **State Management**: Zustand for global state (wallpaper, wifi, window status).
  - **Animations**: Powered by GSAP and Tailwind CSS for smooth, native-like transitions.
  - **Type Safety**: strict TypeScript configuration for robust code quality.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun (recommended)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/pantha704/MacFolio.git
    cd MacFolio
    ```

2.  **Install dependencies**

    ```bash
    bun install
    # or
    npm install
    ```

3.  **Start development server**

    ```bash
    bun run dev
    ```

4.  **Build for production**

    ```bash
    bun run build
    ```

## Customization

MacFolio is designed to be easily customizable.

- **Personal Data**: Edit `src/constants/index.ts` to update your projects, social links, and bio.
- **Images**: Add your assets to `public/images` and reference them in the configuration.
- **Styles**: Global styles are defined in `src/index.css`, using Tailwind CSS for component styling.
