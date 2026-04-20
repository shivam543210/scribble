const { mockDeep, mockReset } = require('jest-mock-extended');
const { prisma } = require('../config/db');

jest.mock('../config/db', () => ({
  __esModule: true,
  prisma: mockDeep(),
}));

const prismaMock = prisma;

beforeEach(() => {
  mockReset(prismaMock);
});

module.exports = { prismaMock };
