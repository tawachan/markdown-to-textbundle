export const removeUniqueIdFromFileName = (fileName) => {
  // Notionは "〈物語〉シリーズ セカンドシーズン b537c73e8449496e9d4bbd7c8c570922" のように最後にIDが付いた名称になるのでこれを取り除く
  const fileNameArray = fileName.split(" ");
  fileNameArray.pop();
  return fileNameArray.join(" ");
};
