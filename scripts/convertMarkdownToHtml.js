const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { logError, validateApiKey, handleApiRequest, logGenerationStatus } = require('./errorHandling');

const convertMarkdownToHtml = async (filePath) => {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const rawHtml = md.render(markdown);

  const sections = rawHtml.split(/<h[1-3]>/).map((section, index) => {
    if (index === 0) return section; // Skip the first split part as it is before the first heading
    return `<section>${section}<audio src="section-${index}.mp3" controls></audio><img src="image-${index}.png" alt="Placeholder image"></section>`;
  }).join('');

  // Read styles from articles/example.html
  const exampleHtml = fs.readFileSync(path.join(__dirname, '../articles/example.html'), 'utf-8');
  const styleMatch = exampleHtml.match(/<style>([\s\S]*?)<\/style>/);
  const styles = styleMatch ? styleMatch[1] : '';

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Converted Markdown</title>
      <style>
        ${styles}
      </style>
      <script src="../player.js"></script>
    </head>
    <body>
      ${sections}
    </body>
    </html>
  `;

  const outputFilePath = path.join(path.dirname(filePath), 'output.html');
  fs.writeFileSync(outputFilePath, htmlTemplate, 'utf-8');

  const audioPlaceholders = markdown.match(/\[audio:(.*?)\]/g);
  if (audioPlaceholders) {
    for (const placeholder of audioPlaceholders) {
      const text = placeholder.match(/\[audio:(.*?)\]/)[1];
      const audioFilePath = path.join(__dirname, '../docs/audio', `${text}.mp3`);

      if (!fs.existsSync(audioFilePath)) {
        try {
          const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: text,
            max_tokens: 100
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
          });

          const audioContent = response.data.choices[0].text;
          fs.writeFileSync(audioFilePath, audioContent, 'binary');

          ffmpeg(audioFilePath)
            .audioBitrate('128k')
            .save(audioFilePath.replace('.mp3', '-compressed.mp3'))
            .on('end', () => {
              fs.renameSync(audioFilePath.replace('.mp3', '-compressed.mp3'), audioFilePath);
            });
        } catch (error) {
          console.error(`Error generating audio for text "${text}":`, error);
        }
      }
    }
  }
};

const filePath = process.argv[2];
if (filePath) {
  convertMarkdownToHtml(filePath).then(() => {
    console.log('Markdown to HTML conversion completed.');
  }).catch((error) => {
    console.error('Error during conversion:', error);
  });
} else {
  console.error('Please provide a Markdown file path as an argument.');
}
