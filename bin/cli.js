#!/usr/bin/env node

import { program } from "commander";
import resize from "../src/core/resize.js";
import help from "../src/core/help.js";
import parseCSV from "../src/utility/parseCSV.js";

program
  .name("rizer")
  .description("Resize images to multiple resolutions (width, height, or ratio)")
  .argument("<file>", "Input image file")
  .option("-w, --width <values>", "Comma-separated widths (in px)", parseCSV)
  .option("-h, --height <values>", "Comma-separated heights (in px)", parseCSV)
  .option("-r, --ratio <values>", "Comma-separated scale ratios (0 < ratio ≤ 1)", parseCSV)
  .option("-u, --allow-upscale", "Allow upscaling images beyond original size", false)
  .option("-o, --outdir <dir>", "Output directory", ".")
  .action(resize);

program.on("--help", help);

program.parse();
