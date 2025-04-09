import { cosmiconfig } from "cosmiconfig";
import Ajv from "ajv";
import schema from "./schema.json" assert { type: "json" };
import chalk from "chalk";

const explorer = cosmiconfig("rizer");
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

/**
 * Loads and validates rizer config (unless ignored).
 * @param {boolean} ignoreConfig
 * @returns {Promise<object>}
 */
export default async function loadConfig(ignoreConfig = false) {
  if (ignoreConfig) {
    return {};
  }

  try {
    const result = await explorer.search();

    if (!result || !result.config) {
      return {};
    }

    const config = result.config;

    const valid = validate(config);
    if (!valid) {
      console.error(chalk.red("❌ Invalid rizer configuration:"));
      for (const err of validate.errors) {
        const path = err.instancePath || "/";
        console.error(`• ${chalk.yellow(path)} ${chalk.gray(err.message)}`);
      }
      process.exit(1);
    }

    return config;
  } catch (error) {
    console.warn(chalk.red("⚠ Failed to load config:"), chalk.gray(error.message));
    return {};
  }
}
