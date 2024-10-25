import { useEffect, useRef, useState } from 'react';
import { WordsGenerate } from '../scripts/wordsGenerate';
import './TypingTest.css';
import { Container } from '@mui/material';
import CapsLockSnackbar from '../CaplockAlert';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import useSound from 'use-sound';
import DisplayExtraWords from '../DisplayExtraWords';

function TypingTest() {
  // Stats
  const maxTime = 60;
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [WPM, setWPM] = useState(0);
  // Typing
  const [isTyping, setIsTyping] = useState(false);
  const [inputWordsHistory, setInputWordsHistory] = useState([]);
  // Text
  const wordsRef = useRef([]);
  const inputRef = useRef();
  const containerRef = useRef();
  const [wordIndex, setWordIndex] = useState(0);
  const [keyStroke, setKeyStroke] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  // Correct/Wrong
  const [correctWrong, setCorrectWrong] = useState([]);
  const [correctWords, setCorrectWords] = useState(0);
  const [percentCorrect, setPercentCorrect] = useState(0);
  // Random words
  const [wordsDict, setWordsDict] = useState(WordsGenerate());
  const paragraph = wordsDict.join(' ');
  // Caps Lock
  const [capsLocked, setCapsLocked] = useState(false);
  // Sound
  const [openSound, setOpenSound] = useState(false);
  const [play] = useSound('src/assets/sound/keyboard.wav');
  // Reset the typing test
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear the input field
      inputRef.current.focus(); // Focus on the input field
    }
    const initialCorrectWrong = wordsDict.map((word) =>
      Array(word.length).fill('')
    );
    setCorrectWrong(initialCorrectWrong); // Tạo một mảng mới với độ dài = độ dài của chuỗi input mỗi khi người dùng nhập, mỗi phần tử trong mảng sẽ được gán giá trị là '' (chuỗi rỗng)
  }, [inputRef, wordsDict]);
  // Set the time interval
  useEffect(() => {
    let interval;
    if (isTyping && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsTyping(false);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isTyping, timeLeft]); // Do not put charIndex, mistake in the dependency array
  // Calculate WPM
  useEffect(() => {
    if (timeLeft > 0 && isTyping) {
      let totalTime = maxTime - timeLeft;
      const currWpm = (keyStroke / 5 / (totalTime + 1)) * 60.0;
      setWPM(Math.round(currWpm));
    }
  }, [isTyping, timeLeft, keyStroke]);
  // Handle input change
  const handleChange = (e) => {
    const typedInput = e.target.value;
    const updatedHistory = [...inputWordsHistory]; // đảm bảo tính immutable trong react
    const characters = wordsRef.current[wordIndex].querySelectorAll('.char');
    const currentCharIndex = charIndex;
    updatedHistory[wordIndex] = typedInput;
    setInputWordsHistory(updatedHistory);
    if (timeLeft > 0 && currentCharIndex < characters.length) {
      let currentChar = characters[currentCharIndex];
      let typedChar = typedInput.slice(-1);
      if (!isTyping) {
        setIsTyping(true);
      }
      if (typedChar === currentChar.textContent) {
        setCorrectWrong((prev) => {
          const newCorrectWrong = [...prev];
          newCorrectWrong[wordIndex] = [...newCorrectWrong[wordIndex]]; // Clone the array for immutability
          newCorrectWrong[wordIndex][currentCharIndex] = 'correct'; // Update the specific character
          return newCorrectWrong;
        });
      } else {
        setCorrectWrong((prev) => {
          const newCorrectWrong = [...prev];
          newCorrectWrong[wordIndex] = [...newCorrectWrong[wordIndex]];
          newCorrectWrong[wordIndex][currentCharIndex] = 'wrong'; // Mark as wrong
          return newCorrectWrong;
        });
      }
    }
    setCharIndex(charIndex + 1);
  };
  // Check the percentage of correct words
  const checkPercentCorrect = () => {
    const typedWord = inputWordsHistory[wordIndex];
    const wordAtIndex = wordsDict[wordIndex];
    if (!correctWrong[wordIndex]) return; // Kiểm tra nếu correctWrong[wordIndex] tồn tại
    if (typedWord === wordAtIndex) {
      setCorrectWords((prevCorrectWords) => prevCorrectWords + 1);
    }
    setPercentCorrect(Math.floor((correctWords / wordIndex) * 100) || 0);
  };
  // Handle Caps Lock
  const handleKeyUp = (e) => {
    setCapsLocked(e.getModifierState('CapsLock'));
  };
  // Handle key down
  const handleKeyDown = (e) => {
    const keyCode = e.keyCode;
    // Play sound when typing
    if (openSound) {
      play();
    }
    // handle caps lock
    setCapsLocked(e.getModifierState('CapsLock'));
    // handle count key stroke
    if (keyCode >= 65 && keyCode <= 90) {
      setKeyStroke(keyStroke + 1);
    }
    // handle space key
    if (keyCode === 32) {
      e.preventDefault();
      checkPercentCorrect();
      if (timeLeft > 0 && isTyping) {
        let currentWord = wordsDict[wordIndex];
        let typeInput = inputWordsHistory[wordIndex] || '';
        if (currentWord != typeInput) {
          setCorrectWrong((prev) => {
            const newCorrectWrong = [...prev];
            newCorrectWrong[wordIndex] = [...newCorrectWrong[wordIndex]];
            newCorrectWrong[wordIndex][charIndex] = 'wrong'; // Mark as wrong
            return newCorrectWrong;
          });
        }
        setWordIndex((prev) => prev + 1);
        setCharIndex(0);
        inputRef.current.value = ''; // Xóa giá trị trong input
      }
    }
    //handle backspace key
    if (keyCode === 8) {
      if (charIndex > 0) {
        e.preventDefault(); // Ngăn chặn hành động mặc định của Backspace
        // Cập nhật lịch sử nhập liệu
        const updatedHistory = [...inputWordsHistory];
        const typedInput = updatedHistory[wordIndex] || '';
        const newTypedInput = typedInput.slice(0, -1); // Xóa ký tự cuối
        setInputWordsHistory((prev) => {
          const newHistory = [...prev];
          newHistory[wordIndex] = newTypedInput;
          return newHistory;
        });
        // Cập nhật ô nhập
        inputRef.current.value = newTypedInput;
        // Cập nhật trạng thái đúng/sai
        const newCorrectWrong = [...correctWrong];
        if (charIndex > 0) {
          newCorrectWrong[wordIndex][charIndex - 1] = ''; // Đánh dấu ký tự vừa xóa là không đúng
        }
        setCorrectWrong(newCorrectWrong);
        // Cập nhật charIndex
        setCharIndex(charIndex - 1);
      }
    }
  };
  // Check the percentage of correct words
  useEffect(() => {
    checkPercentCorrect();
  }, [wordIndex]);
  // Handle sound
  const handleSound = () => {
    setOpenSound(!openSound);
  };
  // Reset the typing test
  const reset = () => {
    const initialCorrectWrong = wordsDict.map((word) =>
      Array(word.length).fill('')
    );
    inputRef.current.focus();
    inputRef.current.value = '';
    setIsTyping(false);
    setTimeLeft(maxTime);
    setCharIndex(0);
    setWPM(0);
    setCorrectWords(0);
    setPercentCorrect(0);
    setKeyStroke(0);
    setCorrectWrong(initialCorrectWrong);
    setWordsDict(WordsGenerate());
    setWordIndex(0);
    setInputWordsHistory([]);
    // Cuộn lại đầu đoạn văn
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // Focus on the input field when the page is loaded or clicked
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
  // Scroll to the current word
  useEffect(() => {
    const wordElement = wordsRef.current[wordIndex];
    // cuộn cho phần tử wordElement nằm chính giữa khung hình
    if (wordElement) {
      wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [wordIndex]);
  return (
    <Container>
      <CapsLockSnackbar open={capsLocked}></CapsLockSnackbar>
      <input
        type='text'
        className='input-field'
        onChange={handleChange}
        ref={inputRef}
        onKeyDown={(e) => {
          handleKeyDown(e);
        }}
        onKeyUp={(e) => {
          handleKeyUp(e);
        }}
      />
      <div className='type-box' ref={containerRef}>
        {paragraph.split(' ').map((word, wIndex) => {
          return (
            <span
              className={`word`}
              key={wIndex}
              ref={(e) => {
                wordsRef.current[wIndex] = e;
              }}
            >
              {word.split('').map((char, cIndex) => (
                <span
                  className={`char ${
                    wIndex === wordIndex && cIndex === charIndex ? 'active' : ''
                  }${correctWrong[wIndex] && correctWrong[wIndex][cIndex]}`}
                  key={`word${wordIndex}_${cIndex}`}
                >
                  {char}
                </span>
              ))}
              {DisplayExtraWords(word, wIndex, inputWordsHistory)}
              <span className='space'> </span>
            </span>
          );
        })}
      </div>
      <div className='result'>
        <p className='time-left'>
          Time Left: <strong>{timeLeft}</strong>
        </p>
        <p className='wpm'>
          WPM: <strong>{WPM}</strong>
        </p>
        <p className='correct-words'>
          Correct: <strong>{percentCorrect}%</strong>
        </p>
        <div className='btn'>
          <div className='reset btn' onClick={reset}>
            <RestartAltIcon
              sx={{
                fontSize: 30,
              }}
            />
          </div>
          <div className='play-sound btn' onClick={handleSound}>
            <VolumeUpIcon
              sx={{
                fontSize: 30,
                color: openSound ? '#BB86FC' : '#706D6D',
              }}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default TypingTest;
