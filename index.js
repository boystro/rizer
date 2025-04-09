#!/usr/bin/env node

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { program } from "commander";
import chalk from "chalk";

function parseCSV(val) {
  return val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

program
  .name("rizer")
  .description(
    "Resize images to multiple resolutions (width, height, or ratio)"
  )
  .argument("<file>", "Input image file")
  .option("-w, --width <values>", "Comma-separated widths (in px)", parseCSV)
  .option("-h, --height <values>", "Comma-separated heights (in px)", parseCSV)
  .option(
    "-r, --ratio <values>",
    "Comma-separated scale ratios (0 < ratio ≤ 1)",
    parseCSV
  )
  .option(
    "-u, --allow-upscale",
    "Allow upscaling images beyond original size",
    false
  )
  .option("-o, --outdir <dir>", "Output directory", ".")
  .action(async (file, options) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red("❌ File not found:"), chalk.yellow(file));
      process.exit(1);
    }

    const image = sharp(file);
    const meta = await image.metadata();
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const outDir = options.outdir;

    let targets = [];

    if (options.width) {
      targets = options.width.map((w) => {
        const width = parseInt(w);
        if (!options.allowUpscale && width > meta.width) {
          console.log(
            chalk.gray(
              `✖ Skipping width ${width}px (original: ${meta.width}px)`
            )
          );
          return null;
        }
        return { width };
      });
    } else if (options.height) {
      targets = options.height.map((h) => {
        const height = parseInt(h);
        if (!options.allowUpscale && height > meta.height) {
          console.log(
            chalk.gray(
              `✖ Skipping height ${height}px (original: ${meta.height}px)`
            )
          );
          return null;
        }
        return { height };
      });
    } else {
      const ratios = options.ratio || ["0.25", "0.5", "0.75"];
      targets = ratios.map((r) => {
        const ratio = parseFloat(r);
        if (ratio <= 0 || ratio > 1) {
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

      let suffix = t.suffix;
      if (!suffix) {
        if (t.width) suffix = `@${t.width}px`;
        else if (t.height) suffix = `@${t.height}px`;
      }
      const outPath = path.join(outDir, `${name}${suffix}${ext}`);

      try {
        await image.clone().resize(resizeOptions).toFile(outPath);
        console.log(chalk.green("✔ Generated:"), chalk.cyan(outPath));
      } catch (err) {
        console.error(
          chalk.red(`✖ Failed to generate ${suffix}:`),
          chalk.gray(err.message)
        );
      }
    }
  });

program.on("--help", () => {
  console.log("");
  console.log(chalk.magenta("Examples:"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-w 320,640"));
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-h 240,480"));
  console.log(
    chalk.gray("  $"),
    "rizer image.jpg",
    chalk.yellow("-r 0.25,0.5")
  );
  console.log(chalk.gray("  $"), "rizer image.jpg", chalk.yellow("-w 1920 -u"));
  console.log(chalk.gray("  $"), "rizer image.jpg");
});

program.parse();
