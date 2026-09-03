const fs = require('fs');
const file = 'c:/Users/sandle/cafe (3)/cafe-admin/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('API_BASE_URL')) {
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { API_BASE_URL } from '../config.js';");
}

// Replace 'http://localhost:5000/api/...' with `${API_BASE_URL}/...`
content = content.replace(/'http:\/\/localhost:5000\/api([^']+)'/g, '`${API_BASE_URL}$1`');
content = content.replace(/"http:\/\/localhost:5000\/api([^"]+)"/g, '`${API_BASE_URL}$1`');
// Replace `http://localhost:5000/api/...` with `${API_BASE_URL}/...`
content = content.replace(/`http:\/\/localhost:5000\/api/g, '`${API_BASE_URL}');

fs.writeFileSync(file, content);
console.log('Fixed URLs');
