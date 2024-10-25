function DisplayExtraWords(word, index, inputHistory) {
  let input = inputHistory[index] || '';

  if (input.length > word.length) {
    const displayExtra = input.slice(word.length, input.length).split('');
    return displayExtra.map((char, idx) => (
      <span key={idx} className='char wrong'>
        {char}
      </span>
    ));
  }
  return null;
}

export default DisplayExtraWords;
