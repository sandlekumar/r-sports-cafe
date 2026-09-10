const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
cp.execSync(`"${ffmpeg}" -y -i src/assets/hero-video-opt.mp4 -vcodec libx264 -x264-params keyint=1 -crf 28 src/assets/hero-scrub.mp4`, { stdio: 'inherit' });
