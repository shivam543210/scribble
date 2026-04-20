/**
 * Generates a random alphanumeric room code
 * @param {number} length - Length of the code
 * @returns {string} Random code
 */
const generateCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = { generateCode };
