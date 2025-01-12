const fs = require('fs');
const path = require('path');

const generateIndexJson = () => {
  const articlesDir = path.join(__dirname, '../docs/articles');
  const indexFilePath = path.join(articlesDir, 'index.json');

  try {
    const articles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));

    const indexData = articles.map(article => {
      const articlePath = path.join(articlesDir, article);
      const stats = fs.statSync(articlePath);
      const content = fs.readFileSync(articlePath, 'utf-8');
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'Untitled';

      return {
        title: title,
        path: `/docs/articles/${article}`,
        date: stats.birthtime.toISOString().split('T')[0]
      };
    });

    fs.writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error generating index.json:', error);
    fs.writeFileSync(indexFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
};

generateIndexJson();
