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
  infoLines.push(`${BOLD}${GREEN}pantha704@macfolio${RESET}`);
  infoLines.push("----------------");

  infoLines.push(`${BOLD}${GREEN}Experience${RESET}: MacFolio`);
  infoLines.push(`${BOLD}${GREEN}Runtime${RESET}: Node.js in this browser tab`);
  infoLines.push(`${BOLD}${GREEN}Platform${RESET}: ${navigator.platform || 'web browser'}`);
  infoLines.push(`${BOLD}${GREEN}Viewport${RESET}: ${window.innerWidth}×${window.innerHeight}`);
  infoLines.push(`${BOLD}${GREEN}Session${RESET}: resets when this page closes`);
  infoLines.push(`${BOLD}${GREEN}Shell${RESET}: jsh`);
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
