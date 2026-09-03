const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');

const input = 'src/assets/hero-video-opt.mp4';
const outputDir = 'public/assets/hero-frames'; // Put in public so they are easily accessible by URL

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Extracting frames...');
try {
  execSync(`"${ffmpeg}" -i ${input} -vf fps=60 -q:v 1 ${outputDir}/frame_%05d.jpg`, { stdio: 'inherit' });
  console.log('Frames extracted successfully.');
} catch (e) {
  console.error('Error extracting frames:', e);
}
