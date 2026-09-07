const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
];

const navIcons = [
  { id: 1, img: "/icons/wifi.svg" },
  { id: 2, img: "/icons/search.svg" },
  { id: 3, img: "/icons/user.svg" },
];

const dockApps = [
  {
    id: "finder",
    name: "Finder",
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "safari",
    name: "Safari",
    icon: "safari.png",
    canOpen: true,
  },
  {
    id: "photos",
    name: "Photos",
    icon: "photos.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Contact",
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Archive",
    icon: "trash.png",
    canOpen: true,
  },
];

const blogPosts = [
  {
    id: 1,
    date: "Sep 2, 2025",
    title:
      "TypeScript Explained: What It Is, Why It Matters, and How to Master It",
    image: "/images/blog1.png",
    link: "https://jsmastery.com/blog/typescript-explained-what-it-is-why-it-matters-and-how-to-master-it",
  },
  {
    id: 2,
    date: "Aug 28, 2025",
    title: "The Ultimate Guide to Mastering Three.js for 3D Development",
    image: "/images/blog2.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-three-js-for-3d-development",
  },
  {
    id: 3,
    date: "Aug 15, 2025",
    title: "The Ultimate Guide to Mastering GSAP Animations",
    image: "/images/blog3.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-gsap-animations",
  },
];

const techStack = [
  { category: "Frontend", items: ["React", "Next.js", "Astro", "TypeScript"] },
  { category: "Backend", items: ["Node.js", "Hono", "Express"] },
  { category: "Blockchain", items: ["Rust", "Solana", "Anchor"] },
  { category: "Data", items: ["PostgreSQL", "Turso", "Prisma", "Drizzle"] },
  { category: "AI / Automation", items: ["Groq", "Playwright", "Web Crawling"] },
  { category: "Platform", items: ["Docker", "Cloudflare", "Vercel", "Git"] },
];

const socials = [
  {
    id: 1,
    text: "Github",
    icon: "/icons/github.svg",
    bg: "#f4656b",
    link: "https://github.com/pantha704",
  },
  // {
  //   id: 2,
  //   text: "Platform",
  //   icon: "/icons/atom.svg",
  //   bg: "#4bcb63",
  //   link: "https://jsmastery.com/",
  // },
  {
    id: 3,
    text: "Twitter/X",
    icon: "/icons/twitter.svg",
    bg: "#ff866b",
    link: "https://x.com/pantha704",
  },
  // {
  //   id: 4,
  //   text: "LinkedIn",
  //   icon: "/icons/linkedin.svg",
  //   bg: "#05b6f6",
  //   link: "https://www.linkedin.com/company/javascriptmastery/posts/?feedView=all",
  // },
];

const photosLinks = [
  {
    id: 1,
    icon: "/icons/gicon1.svg",
    title: "Library",
  },
  // {
  //   id: 2,
  //   icon: "/icons/gicon2.svg",
  //   title: "Memories",
  // },
  // {
  //   id: 3,
  //   icon: "/icons/file.svg",
  //   title: "Places",
  // },
  {
    id: 5,
    icon: "/icons/gicon5.svg",
    title: "Favorites",
  },
];

export {
  navLinks,
  navIcons,
  dockApps,
  blogPosts,
  techStack,
  socials,
  photosLinks,
};

const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Work",
  icon: "/icons/work.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "MacFolio",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Live", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://mac-folio-three.vercel.app/" },
        { id: 2, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/MacFolio" },
        { id: 3, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/MacFolio" },
      ],
    },
    {
      id: 2,
      name: "Atlas",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Live", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://atlas-nine-ashy.vercel.app/" },
        { id: 2, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/atlas" },
        { id: 3, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/atlas" },
      ],
    },
    {
      id: 3,
      name: "CrawlMind",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/CrawlMind" },
        { id: 2, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/CrawlMind" },
      ],
    },
    {
      id: 4,
      name: "Job Finder CLI",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View npm", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://www.npmjs.com/package/@pantha704/job-finder" },
        { id: 2, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/job-finder" },
        { id: 3, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/job-finder" },
      ],
    },
    {
      id: 5,
      name: "Threadline",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Live", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://threadline-aae1c2.webflow.io/" },
        { id: 2, name: "View Coded Reference", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://threadline-ashy.vercel.app/" },
        { id: 3, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/threadline" },
      ],
    },
    {
      id: 6,
      name: "Solverse",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Live", icon: "/images/safari.png", kind: "file", fileType: "url", href: "https://solverse.vercel.app/" },
        { id: 2, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/solverse" },
        { id: 3, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/solverse" },
      ],
    },
    {
      id: 7,
      name: "T3MP3ST",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        { id: 1, name: "View Code", icon: "/images/terminal.png", kind: "file", fileType: "url", href: "https://github1s.com/pantha704/T3MP3ST" },
        { id: 2, name: "View Repo", icon: "/icons/github.svg", kind: "file", fileType: "url", href: "https://github.com/pantha704/T3MP3ST" },
      ],
    },
  ],
};

const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "/icons/info.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-5",
      imageUrl: "/images/adrian.jpg", // Keeping existing image for now, can be updated if user uploads one
    },
    {
      id: 4,
      name: "about-me.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-60 left-5",
      subtitle: "Full-Stack · Web3 · AI / Automation",
      image: "/images/adrian.jpg",
      description: [
        "Hey! I’m Pratham 👋. I build full-stack products, developer tooling, AI/automation systems, and Solana programs.",
        "Recent work spans personalized AI products, web crawling and research infrastructure, CLI automation, interactive frontend systems, and Web3.",
        "I care about architecture, reliability, clear interfaces, and turning ambitious ideas into software that actually ships.",
        "Open Finder → Work for selected projects, or use Spotlight to jump directly to anything in this portfolio.",
      ],
    },
  ],
};

const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "/icons/file.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "Resume.pdf",
      icon: "/images/pdf.png",
      kind: "file",
      fileType: "pdf",
      href: "/files/resume.pdf",
    },
  ],
};

const TRASH_LOCATION = {
  id: 4,
  type: "trash",
  name: "Trash",
  icon: "/icons/trash.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "trash1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-10",
      imageUrl: "/images/trash-1.png",
    },
    {
      id: 2,
      name: "trash2.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-40 left-80",
      imageUrl: "/images/trash-2.png",
    },
  ],
};

export const locations = {
  work: WORK_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  trash: TRASH_LOCATION,
};

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
  finder: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  preview: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };