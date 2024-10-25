const randomIntFormRange = (min, max) => {
  const minNorm = Math.ceil(min);
  const maxNorm = Math.floor(max);
  const idx = Math.floor(Math.random() * (maxNorm - minNorm + 1) + minNorm);
  return idx;
};

export { randomIntFormRange };
