import fs from "fs";
import path from "path";

const OUTPUTS_PATH = "./outputs";
const INPUTS_PATH = "./inputs";
const TEMPLATES_PATH = "./templates";

const ENV = {
  notion: process.env.NOTION === "1",
};

export const removeUniqueIdFromFileName = (fileName) => {
  // Notionは "〈物語〉シリーズ セカンドシーズン b537c73e8449496e9d4bbd7c8c570922" のように最後にIDが付いた名称になるのでこれを取り除く
  const fileNameArray = fileName.split(" ");
  fileNameArray.pop();
  return fileNameArray.join(" ");
};

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

    let modifiedFileName = fileName.replace(".md", "");
    if (ENV.notion) {
      modifiedFileName = removeUniqueIdFromFileName(modifiedFileName);
    }

    const outputFolderPath = path.join(OUTPUTS_PATH, modifiedFileName);

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
