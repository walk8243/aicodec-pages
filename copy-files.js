const fs = require('fs');
const path = require('path');

// ディレクトリの中身のみをコピーする関数
function copyDirectoryContents(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectoryContents(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// メイン処理
function copyWorkspaceFiles() {
  // 環境変数OUTPUT_DIRから書き出し先ディレクトリを取得、設定されていない場合はdistを使用
  const outputDir = process.env.OUTPUT_DIR || 'dist';
  
  // 書き出し用のディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log(`Created ${outputDir} directory`);
  }

  // ルート package.json を読み込む
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const workspaces = rootPkg.workspaces || [];
  console.log('Workspaces found:', workspaces);

  let copiedCount = 0;

  for (const workspace of workspaces) {
    if (!fs.existsSync(workspace)) {
      console.warn(`Workspace "${workspace}" does not exist, skipping...`);
      continue;
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(workspace, 'package.json'), 'utf-8'));
    const name = pkg.name;

    // package.jsonのcopyDirsフィールドからコピー対象ディレクトリを取得
    const copyDirs = pkg.copyDirs || [];
    
    if (copyDirs.length > 0) {
      for (const dir of copyDirs) {
        const srcDir = path.join(workspace, dir);
        if (fs.existsSync(srcDir)) {
          // コピー先はworkspace名のディレクトリ直下（指定されたディレクトリ自体は作成しない）
          const destDir = path.join(outputDir, name);
          console.log(`Copying contents from ${workspace}/${dir} to ${destDir}`);
          copyDirectoryContents(srcDir, destDir);
          console.log(`Successfully copied contents from ${workspace}/${dir} to ${destDir}`);
          copiedCount++;
        } else {
          console.warn(`Directory "${workspace}/${dir}" does not exist, skipping...`);
        }
      }
    } else {
      console.log(`No copyDirs specified in ${workspace}/package.json, skipping...`);
    }
  }

  console.log(`\nCopy process completed! Copied ${copiedCount} directory(ies).`);
}

// スクリプト実行
copyWorkspaceFiles();
