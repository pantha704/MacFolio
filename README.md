# 🖥️ MacFolio - Interactive macOS Portfolio

A stunning, fully interactive portfolio website inspired by macOS Big Sur, featuring a desktop-like experience with draggable windows, a functional dock, and beautiful UI elements.

![MacFolio Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎨 **Pixel-Perfect macOS UI** - Authentic macOS Big Sur design with smooth animations
- 🪟 **Interactive Windows** - Draggable, resizable windows with minimize/maximize functionality
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🖱️ **Functional Dock** - Just like macOS with hover effects and app launching
- 📂 **File System Navigation** - Browse through projects, photos, and files
- 🌙 **Dark Mode Support** - Beautiful light and dark themes
- ⚡ **Lightning Fast** - Built with Vite for optimal performance
- 🎯 **Interactive Elements** - Clickable links, opening applications, and more

## 🚀 Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4.1
- **Date Handling:** Day.js
- **Package Manager:** Bun
- **Linting:** ESLint 9

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/pantha704/MacFolio.git
   cd MacFolio
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

## 🏗️ Build for Production

```bash
bun run build
# or
npm run build
```

Preview the production build:

```bash
bun run preview
# or
npm run preview
```

## 📁 Project Structure

```
macos-portfolio/
├── public/
│   ├── icons/           # UI icons (wifi, search, user, etc.)
│   ├── images/          # Project screenshots, gallery, profile
│   ├── files/           # Resume PDF and documents
│   └── macbook.png      # Device mockup
├── src/
│   ├── components/      # React components
│   │   └── Navbar.tsx   # Top menu bar
│   ├── constants/       # App configuration and data
│   │   └── index.ts     # Nav links, projects, tech stack, etc.
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🎯 Customization

### Update Personal Information

Edit `src/constants/index.ts` to customize:

- **Projects** - Add your portfolio projects in `WORK_LOCATION`
- **Social Links** - Update `socials` array with your links
- **Tech Stack** - Modify `techStack` with your skills
- **Blog Posts** - Add your articles in `blogPosts`
- **Gallery** - Replace images in the `gallery` array
- **About Me** - Update `ABOUT_LOCATION` with your info

### Example: Adding a New Project

```typescript
{
  id: 8,
  name: "My Awesome Project",
  icon: "/images/folder.png",
  kind: "folder",
  position: "top-10 left-5",
  children: [
    {
      id: 1,
      name: "Project Description.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      description: [
        "Your project description here...",
      ],
    },
    // Add more files...
  ],
}
```

### Update Resume

Replace `/public/files/resume.pdf` with your own resume.

### Change Colors & Styling

All Tailwind styles can be customized in:

- `src/index.css` - Global styles
- Individual component files

## 📱 Applications Included

- **Portfolio** (Finder) - Browse your projects
- **Articles** (Safari) - Your blog posts
- **Gallery** (Photos) - Image gallery
- **Contact** - Get in touch form
- **Skills** (Terminal) - Tech stack showcase
- **Archive** (Trash) - Fun easter egg

## 🛠️ Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `bun run dev`     | Start development server |
| `bun run build`   | Build for production     |
| `bun run preview` | Preview production build |
| `bun run lint`    | Run ESLint               |

## 🌟 Features Showcase

### Navigation Bar

- System menu with dropdowns
- Current time display
- System icons (WiFi, Search, User, Dark Mode)

### Dock

- Hover effects with app magnification
- App launch functionality
- Active app indicators

### Windows

- Draggable and resizable
- Minimize, maximize, close controls
- Multiple window support with z-index management
- Traffic light controls (red, yellow, green)

### File System

- Nested folder structure
- Multiple file types (txt, pdf, images, URLs)
- File previews and interactions

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💬 Contact

Your Name - [@yourhandle](https://twitter.com/yourhandle)

Project Link: [https://github.com/pantha704/MacFolio](https://github.com/pantha704/MacFolio)

---

<div align="center">
  <sub>Built with ❤️ using React and TypeScript</sub>
</div>
