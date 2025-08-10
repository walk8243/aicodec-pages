const fs = require('fs');
const path = require('path');

// 書き出し用のディレクトリを作成
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// ルート package.json を読み込む
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const workspaces = rootPkg.workspaces || [];
console.log('Workspaces found:', workspaces);

const entries = [];

for (const workspace of workspaces) {
  if (!fs.existsSync(workspace)) {
    console.warn(`Workspace "${workspace}" does not exist, skipping...`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(workspace, 'package.json'), 'utf-8'));
  const name = pkg.name;

  entries.push({ name });
}

// HTMLを生成
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Workspaces Index</title>
  <style>
    body { font-family: sans-serif; padding: 2em; }
    h1 { font-size: 1.5em; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5em 0; }
  </style>
</head>
<body>
  <h1>Workspace Links</h1>
  <ul>
    ${entries.map(e => `<li><a href="${e.name}/">${e.name}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>
`;

// 書き出し
fs.writeFileSync('dist/index.html', html, 'utf-8');
console.log('dist/index.html generated successfully!');
