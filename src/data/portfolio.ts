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

// Curated public repositories verified against GitHub on 2026-09-08.
export const projects = [
  { name: 'Homeworker', repo: 'home-worker', category: 'Document tools', description: 'Turn PDFs and images into reviewable A4 notes using licensed handwriting personas.', tags: ['Python', 'Documents'] },
  { name: 'Auto Apply Jobs', repo: 'auto-apply-jobs', category: 'Automation', description: 'Multi-source application automation with a SQLite queue, session replication and profile-driven form filling.', tags: ['Python', 'Automation'] },
  { name: 'MacFolio', repo: 'MacFolio', category: 'Web experience', description: 'An interactive portfolio desktop with adaptive scenery, photos and a little arcade.', tags: ['React', 'TypeScript'] },
  { name: 'NimRoute', repo: 'nimroute', category: 'Developer tools', description: 'An OpenAI-compatible routing service with tenant keys, metered billing and usage tracking.', tags: ['TypeScript', 'LLM routing'] },
  { name: 'Threadline', repo: 'threadline', category: 'Product concept', description: 'A conversation intelligence product concept and landing page.', tags: ['HTML', 'Design'] },
  { name: 'Leave Tracker', repo: 'aa-leave-tracker', category: 'Workplace tools', description: 'An internal leave and PTO tracking application. Public source code is available below.', tags: ['TypeScript'] },
].map(p => ({ ...p, id: p.repo.toLowerCase(), links: [{ label: 'View source', href: `https://github.com/pantha704/${p.repo}` }] }))
