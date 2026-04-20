/**
 * Word list for the Scribble game
 */
const words = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'flower', 'guitar', 'house', 'island', 'jungle',
  'kangaroo', 'lemon', 'mountain', 'notebook', 'ocean', 'piano', 'queen', 'rocket', 'sunflower', 'tiger',
  'umbrella', 'volcano', 'whale', 'xylophone', 'yacht', 'zebra', 'airplane', 'bicycle', 'computer', 'dolphin',
  'eagle', 'forest', 'galaxy', 'hammer', 'icecream', 'jacket', 'keyboard', 'laptop', 'moon', 'ninja',
  'owl', 'pizza', 'robot', 'spaceship', 'telescope', 'unicorn', 'violin', 'watermelon', 'yo-yo', 'zigzag'
];

/**
 * Get a random word from the list
 * @returns {string} Random word
 */
const getRandomWord = () => {
  return words[Math.floor(Math.random() * words.length)];
};

module.exports = { getRandomWord };
