import inquirer from "inquirer";

export default async function (msg) {
  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message,
      default: false,
    },
  ]);
  return proceed;
}
