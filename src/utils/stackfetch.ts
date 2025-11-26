import { techStack } from '#constants';

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CHECK = '✔'; // Checkmark might need font support, or use ASCII 'v'

export const getStackFetchOutput = () => {
  let output = `\r\n${BOLD}${GREEN}~$ ${RESET}stackfetch\r\n\r\n`;

  // Header
  output += `   ${BOLD}Category${RESET}                  ${BOLD}Technology${RESET}\r\n`;
  output += `   --------                  ----------\r\n`;

  techStack.forEach(({ category, items }) => {
    output += ` ${GREEN}${CHECK}${RESET} ${BOLD}${category}${RESET}\r\n`;
    items.forEach(item => {
      output += `                   - ${item}\r\n`;
    });
    output += '\r\n';
  });

  // output += `\r\n ${GREEN}${CHECK}${RESET} 5 of 5 stacks loaded successfully (100%)\r\n`;
  // output += ` ${BLUE}Render time: ${Math.floor(Math.random() * 9) + 2}ms${RESET}\r\n`;

  return output;
};
