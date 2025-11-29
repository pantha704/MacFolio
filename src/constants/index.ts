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
  {
    id: 1,
    img: "/icons/wifi.svg",
  },
  // {
  //   id: 2,
  //   img: "/icons/search.svg",
  // },
  // {
  //   id: 3,
  //   img: "/icons/user.svg",
  // },
  // {
  //   id: 4,
  //   img: "/icons/mode.svg",
  // },
];

const dockApps = [
  {
    id: "finder",
    name: "Finder", // was "Finder"
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "safari",
    name: "Safari", // was "Safari"
    icon: "safari.png",
    canOpen: true,
  },
  {
    id: "photos",
    name: "Gallery", // was "Photos"
    icon: "photos.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Get in touch", // or "Get in touch"
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Terminal", // was "Terminal"
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Archive", // was "Trash"
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
  {
    category: "Frontend",
    items: ["React.js", "Next.js", "TypeScript"],
  },
  {
    category: "Mobile",
    items: ["React Native", "Expo"],
  },
  {
    category: "Styling",
    items: ["CSS", "Tailwind", "Framer Motion", "GSAP"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "NestJS", "Hono", "Zustand"],
  },
  {
    category: "Database",
    items: ["MongoDB", "PostgreSQL"],
  },
  {
    category: "DevOps",
    items: ["Git", "WebSockets", "Prometheus/Grafana", "Docker/K8s", "gRPC", "Kafka"],
  },
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
      id: 5,
      name: "MacFolio",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "View Live",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://mac-folio-seven.vercel.app/",
        },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/MacFolio",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/MacFolio",
        },
      ],
    },
    {
      id: 6,
      name: "Solverse",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "View Live",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://solverse.vercel.app/",
        },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/solverse",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/solverse",
        },
      ],
    },
    {
      id: 7,
      name: "Solana Starter Kit",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "View Live",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://sol-starter-kit.vercel.app/",
        },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/sol-starter-kit",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/sol-starter-kit",
        },
      ],
    },
    {
      id: 8,
      name: "Anchor AMM",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        // {
        //   id: 1,
        //   name: "View Live",
        //   icon: "/images/safari.png",
        //   kind: "file",
        //   fileType: "url",
        //   href: "https://github.com/pantha704/anchor-amm",
        // },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/anchor-amm",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/anchor-amm",
        },
      ],
    },
    {
      id: 9,
      name: "Anchor Escrow",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        // {
        //   id: 1,
        //   name: "View Live",
        //   icon: "/images/safari.png",
        //   kind: "file",
        //   fileType: "url",
        //   href: "https://github.com/pantha704/anchor-escrow",
        // },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/anchor-escrow",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/anchor-escrow",
        },
      ],
    },
    {
      id: 10,
      name: "Obsidian",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        // {
        //   id: 1,
        //   name: "View Live",
        //   icon: "/images/safari.png",
        //   kind: "file",
        //   fileType: "url",
        //   href: "https://github.com/pantha704/obsidian",
        // },
        {
          id: 2,
          name: "View Code",
          icon: "/images/terminal.png",
          kind: "file",
          fileType: "url",
          href: "https://github1s.com/pantha704/obsidian",
        },
        {
          id: 3,
          name: "View Repo",
          icon: "/icons/github.svg",
          kind: "file",
          fileType: "url",
          href: "https://github.com/pantha704/obsidian",
        },
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
      subtitle: "Full Stack Developer & Blockchain Engineer",
      image: "/images/adrian.jpg",
      description: [
        "Hey! I’m Pratham 👋, a Full Stack Developer and Blockchain Enthusiast.",
        "I specialize in building high-performance web applications and decentralized solutions on Solana.",
        "My stack includes React, Next.js, TypeScript, Rust, and Anchor. I love turning complex ideas into elegant, user-friendly code.",
        "When I'm not coding, I'm exploring the latest in Web3, contributing to open source, or optimizing my terminal config.",
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
      // you can add `href` if you want to open a hosted resume
      // href: "/your/resume/path.pdf",
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
  resume: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };