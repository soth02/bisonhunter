const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function splitBison() {
  const input = path.join(__dirname, '..', 'assets', 'Animals.png');
  const outputDir = path.join(__dirname, '..', 'assets', 'bison');
  fs.mkdirSync(outputDir, { recursive: true });

  const frameWidth = 70;
  const frameHeight = 41;

  const metadata = await sharp(input).metadata();
  const cols = Math.floor(metadata.width / frameWidth);
  const rows = Math.floor(metadata.height / frameHeight);
  let index = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      await sharp(input)
        .extract({
          left: x * frameWidth,
          top: y * frameHeight,
          width: frameWidth,
          height: frameHeight,
        })
        .toFile(path.join(outputDir, `bison${index}.png`));
      index++;
    }
  }
}

if (require.main === module) {
  splitBison();
}

module.exports = { splitBison };
