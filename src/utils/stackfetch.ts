import { techStack } from '#constants';

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

export const getStackFetchOutput = () => {
  const appleLogo = [
    "                    'c.",
    "                 ,xNMM.",
    "               .OMMMMo",
    "               OMMM0,",
    "     .;loddo:' loolloddol;.",
    "   cKMMMMMMMMMMNWMMMMMMMMMM0:",
    " .KMMMMMMMMMMMMMMMMMMMMMMMWd.",
    " XMMMMMMMMMMMMMMMMMMMMMMMX.",
    ";MMMMMMMMMMMMMMMMMMMMMMMM:",
    ":MMMMMMMMMMMMMMMMMMMMMMMM:",
    ".MMMMMMMMMMMMMMMMMMMMMMMMX.",
    " kMMMMMMMMMMMMMMMMMMMMMMMMWd.",
    " .XMMMMMMMMMMMMMMMMMMMMMMMMMMk",
    "  .XMMMMMMMMMMMMMMMMMMMMMMMMK.",
    "    kMMMMMMMMMMMMMMMMMMMMMMd",
    "     ;KMMMMMMMWXXWMMMMMMMk.",
    "       .cooc,.    .,cooc."
  ];

  const infoLines: string[] = [];

  // Header: User@Host
  infoLines.push(`${BOLD}${GREEN}pantha704@macbook-pro${RESET}`);
  infoLines.push("----------------");

  // OS Info (Static for now)
  infoLines.push(`${BOLD}${GREEN}OS${RESET}: macOS Sequoia 15.1`);
  infoLines.push(`${BOLD}${GREEN}Host${RESET}: MacBook Pro (16-inch, ${new Date().getFullYear()})`);
  infoLines.push(`${BOLD}${GREEN}Kernel${RESET}: Darwin 24.1.0`);
  const startDate = new Date('2025-11-25'); // Uptime starts from this date
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  infoLines.push(`${BOLD}${GREEN}Uptime${RESET}: ${diffDays > 0 ? diffDays : 0} days`);
  infoLines.push(`${BOLD}${GREEN}Shell${RESET}: jsh 1.0`);
  infoLines.push(`${BOLD}${GREEN}Resolution${RESET}: 1920x1080`);
  infoLines.push(`${BOLD}${GREEN}DE${RESET}: Aqua`);
  infoLines.push(`${BOLD}${GREEN}WM${RESET}: Quartz Compositor`);
  infoLines.push(""); // Spacer

  infoLines.push(`${BOLD}${GREEN}Tech Stack${RESET}`);
  infoLines.push("----------------");
  // Tech Stack Info
  techStack.forEach(({ category, items }) => {
    infoLines.push(`${BOLD}${GREEN}${category}${RESET}: ${items.join(", ")}`);
  });

  let output = "\r\n";
  const maxLines = Math.max(appleLogo.length, infoLines.length);

  for (let i = 0; i < maxLines; i++) {
    const logoLine = appleLogo[i] || "";
    const infoLine = infoLines[i] || "";

    // Pad logo to 35 chars (width of logo + some margin)
    const paddedLogo = logoLine.padEnd(35, " ");

    // Color the logo green
    const coloredLogo = `${GREEN}${paddedLogo}${RESET}`;

    output += `${coloredLogo}${infoLine}\r\n`;
  }

  output += "\r\n";
  return output;
};
