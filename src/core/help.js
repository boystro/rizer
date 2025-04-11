import chalk from "chalk";

export default () => {
  console.log("");
  console.log(chalk.magenta("Examples:"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-w 320,640"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-h 240,480"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-r 0.25,0.5"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-w 1920 -u"));
  console.log(chalk.gray("  $"), "rizer image.jpg");
};
