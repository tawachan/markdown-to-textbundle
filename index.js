import fs from "fs";
import path from "path";

const OUTPUTS_PATH = "./outputs";
const INPUTS_PATH = "./inputs";
const TEMPLATES_PATH = "./templates";

const main = async () => {
  if (fs.existsSync(OUTPUTS_PATH)) {
    fs.rmSync(OUTPUTS_PATH, { force: true, recursive: true });
  }
  fs.mkdirSync(OUTPUTS_PATH);

  const fileNames = fs.readdirSync(INPUTS_PATH);
  const markdownFileNames = fileNames.filter((n) => n.includes(".md"));

  markdownFileNames.forEach((fileName) => {
    const filePath = path.join(INPUTS_PATH, fileName);
    const text = fs.readFileSync(filePath).toString();

    const assetLinks = [
      ...text.matchAll(/!\[(.+?\.(jpg|png|jpeg))\]\(.+?\.(png|jpeg|jpg)\)/g),
    ].map((r) => r[1]);

    const outputFolderPath = path.join(
      OUTPUTS_PATH,
      fileName.replace(".md", "")
    );

    fs.mkdirSync(outputFolderPath);

    const inputInfoFilePath = path.join(TEMPLATES_PATH, "info.json");
    const outputInfoFilePath = path.join(outputFolderPath, "info.json");
    fs.copyFileSync(inputInfoFilePath, outputInfoFilePath);

    const outPutMarkdownFilePath = path.join(outputFolderPath, fileName);
    fs.copyFileSync(filePath, outPutMarkdownFilePath);

    if (assetLinks.length > 0) {
      assetLinks.forEach((link) => {
        const decodedLink = decodeURIComponent(link);
        const inputAssetPath = path.join(INPUTS_PATH, decodedLink);
        const outputAssetPath = path.join(outputFolderPath, decodedLink);
        const parsed = path.parse(outputAssetPath);
        if (!fs.existsSync(parsed.dir)) {
          fs.mkdirSync(parsed.dir, { recursive: true });
        }
        fs.copyFileSync(inputAssetPath, outputAssetPath);
      });
    }
  });
};

main();
