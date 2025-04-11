import sharp from "sharp";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import loadConfig from "../config/loader.js";
import promptProceed from "../utility/promptProceed.js";

export default async (file, cliOptions) => {
  if (!fs.existsSync(file)) {
    console.error(chalk.red("❌ File not found:"), chalk.yellow(file));
    process.exit(1);
  }

  const config = await loadConfig(cliOptions.ignoreConfig);

  const options = {
    mode: cliOptions.mode || config.mode || "ratio",
    levels: cliOptions.levels || config.levels || [0.25, 0.5, 0.75],
    filenamePattern: cliOptions.filenamePattern || config.filenamePattern || "${name}${suffix}${ext}",
    outputFormat: cliOptions.outputFormat || config.outputFormat || null,
    outputDirectory: cliOptions.outputDirectory || config.outputDirectory || "./resized",
    allowUpscale: cliOptions.allowUpscale ?? config.allowUpscale ?? false,
    widthCount: cliOptions.widthCount,
    heightCount: cliOptions.heightCount,
    ratioCount: cliOptions.ratioCount,
  };

  const image = sharp(file);
  const meta = await image.metadata();
  const ext = options.outputFormat ? `.${options.outputFormat}` : path.extname(file);
  const name = path.basename(file, path.extname(file));
  const outDir = options.outputDirectory;

  // Validate CLI ratios
  if (cliOptions.width && cliOptions.width.some((w) => isNaN(w) || w < 1 || !Number.isInteger(Number(w)))) {
    const proceed = await promptProceed("⚠ Some values in --width look like ratios. Continue anyway?");
    if (!proceed) process.exit(0);
  }
  if (cliOptions.height && cliOptions.height.some((h) => isNaN(h) || h < 1 || !Number.isInteger(Number(h)))) {
    const proceed = await promptProceed("⚠ Some values in --height look like ratios. Continue anyway?");
    if (!proceed) process.exit(0);
  }

  // Compute levels based on count
  if (!options.levels) {
    const count = options.widthCount || options.heightCount || options.ratioCount || 3;
    const step = (val) => Math.floor(val / (count + 1));

    if (options.mode === "width") {
      const s = step(meta.width);
      options.levels = Array.from({ length: count }, (_, i) => s * (i + 1));
    } else if (options.mode === "height") {
      const s = step(meta.height);
      options.levels = Array.from({ length: count }, (_, i) => s * (i + 1));
    } else {
      const step = 1 / (count + 1);
      options.levels = Array.from({ length: count }, (_, i) => Number(((i + 1) * step).toFixed(2)));
    }
  }

  let targets = [];

  if (options.mode === "width") {
    targets = options.levels.map((w) => {
      const width = parseInt(w);
      if (!options.allowUpscale && width >= meta.width) {
        console.log(chalk.gray(`✖ Skipping width ${width}px (original: ${meta.width}px)`));
        return null;
      }
      return { width, suffix: `@${width}px` };
    });
  } else if (options.mode === "height") {
    targets = options.levels.map((h) => {
      const height = parseInt(h);
      if (!options.allowUpscale && height >= meta.height) {
        console.log(chalk.gray(`✖ Skipping height ${height}px (original: ${meta.height}px)`));
        return null;
      }
      return { height, suffix: `@${height}px` };
    });
  } else {
    targets = options.levels.map((r) => {
      const ratio = parseFloat(r);
      if (ratio <= 0 || ratio >= 1) {
        console.log(chalk.red(`✖ Invalid ratio:`), chalk.yellow(ratio));
        return null;
      }
      const width = Math.round(meta.width * ratio);
      const height = Math.round(meta.height * ratio);
      return { width, height, suffix: `@${r}` };
    });
  }

  for (const t of targets) {
    if (!t) continue;

    const resizeOptions = {};
    if (t.width) resizeOptions.width = t.width;
    if (t.height) resizeOptions.height = t.height;

    const suffix = t.suffix || "";
    const outputFileName = options.filenamePattern
      .replace("${name}", name)
      .replace("${suffix}", suffix)
      .replace("${ext}", ext);

    const outPath = path.join(outDir, outputFileName);

    try {
      let output = image.clone().resize(resizeOptions);
      if (options.outputFormat) output = output.toFormat(options.outputFormat);
      await output.toFile(outPath);
      console.log(chalk.green("✔ Generated:"), chalk.cyan(outPath));
    } catch (err) {
      console.error(chalk.red(`✖ Failed to generate ${suffix}:`), chalk.gray(err.message));
    }
  }
};
