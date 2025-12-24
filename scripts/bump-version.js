#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 버전 자동 증가 스크립트
 * usage: node scripts/bump-version.js [major|minor|patch]
 * default: patch
 */

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

// 명령행 인자로 증가할 버전 부분을 받음 (기본값: patch)
const versionPart = process.argv[2] || 'patch';

// 현재 버전 파싱
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;

// 버전 증가 로직
switch (versionPart.toLowerCase()) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// package.json 업데이트
packageJson.version = newVersion;

// 파일에 쓰기
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf-8'
);

console.log(`\x1b[32m✓ 버전이 ${currentVersion}에서 ${newVersion}으로 증가되었습니다.\x1b[0m`);
console.log(`\x1b[36m증가 유형: ${versionPart}\x1b[0m`);