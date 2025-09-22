const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets', 'bison');
const scriptPath = path.join(__dirname, '..', 'scripts', 'split-bison.js');

beforeAll(() => {
  fs.rmSync(outputDir, { recursive: true, force: true });
});

test('splitBison creates first bison frame', async () => {
  const { splitBison } = require(scriptPath);
  await splitBison();
  const filePath = path.join(outputDir, 'bison1.png');
  expect(fs.existsSync(filePath)).toBe(true);
});
