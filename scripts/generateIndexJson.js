const fs = require('fs');
const path = require('path');

const generateIndexJson = () => {
  const articlesDir = path.join(__dirname, '../docs/articles');
  const indexFilePath = path.join(articlesDir, 'index.json');

  const articles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));

  const indexData = {
    recent: articles.slice(-5),
    all: articles.map(article => {
      const articlePath = path.join(articlesDir, article);
      const stats = fs.statSync(articlePath);
      return {
        title: article.replace('.html', ''),
        creationDate: stats.birthtime
      };
    })
  };

  fs.writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2), 'utf-8');
};

generateIndexJson();
