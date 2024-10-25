import { randomIntFormRange } from './randomInt';
import { COMMON_WORDS } from '../constant/constants';

const WordsGenerate = () => {
  const words = [];
  for (let i = 0; i < 200; i++) {
    const rand = randomIntFormRange(0, 550);
    let wordValue = COMMON_WORDS[rand].val;
    words.push(wordValue);
  }
  return words;
};

export { WordsGenerate };
