import { locations } from '#constants'

// Public portfolio identity, preserved from the original repository.
export const profile = {
  name: 'Pratham Jaiswal',
  firstName: 'Pratham',
  role: 'Full Stack Developer & Blockchain Engineer',
  email: 'pratham.jaiswal2004@gmail.com',
  github: 'https://github.com/pantha704',
  twitter: 'https://x.com/pantha704',
  avatar: 'https://avatars.githubusercontent.com/u/100998543?v=4',
  location: 'India',
  resume: '/files/resume.pdf',
}

const details: Record<string, { category: string; description: string; tags: string[] }> = {
  MacFolio: { category: 'Web experience', description: 'A personal desktop on the web. Explore projects, browse photos, and open a real terminal.', tags: ['React', 'TypeScript', 'GSAP'] },
  Solverse: { category: 'Solana', description: 'Explore my Solverse project, its live experience, and the code behind it.', tags: ['Web3', 'Solana'] },
  'Solana Starter Kit': { category: 'Developer tools', description: 'A starting point for building on Solana. Browse the live project or explore the source.', tags: ['Solana', 'Developer tools'] },
  'Anchor AMM': { category: 'Solana', description: 'An automated market maker project built with Anchor. Explore the implementation on GitHub.', tags: ['Rust', 'Anchor'] },
  'Anchor Escrow': { category: 'Solana', description: 'An escrow project built with Anchor. Explore the program and its source code.', tags: ['Rust', 'Anchor'] },
  Obsidian: { category: 'Open source', description: 'Explore the Obsidian repository and browse the implementation.', tags: ['Open source'] },
}

export const projects = locations.work.children.map(project => ({
  id: project.id,
  name: project.name,
  ...details[project.name],
  links: project.children.map(link => ({ label: link.name, href: link.href })),
}))
