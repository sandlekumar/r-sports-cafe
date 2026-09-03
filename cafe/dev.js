import { spawn } from 'child_process';

console.log('🚀 Starting Backend Server (Port 5000)...');
const server = spawn('node', ['server/index.js'], { stdio: 'inherit', shell: true });

console.log('⚡ Starting Frontend (Vite)...');
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  server.kill();
  vite.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
