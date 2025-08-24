
export const getEcoAction = (attributes: string[]): string | null => {
  const attributeString = attributes.sort().join('/');

  const ecoActionMap: { [key: string]: string } = {
    '飲食多め/屋外フェス/混雑': 'ゴミ袋＋未使用手袋持参',
    '屋内/混雑': 'マイボトル持参',
    '物販多め': 'エコバッグ持参',
  };

  return ecoActionMap[attributeString] || null;
};
