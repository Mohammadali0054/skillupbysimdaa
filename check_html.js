const fs = require('fs');
const html = fs.readFileSync('output.html', 'utf8');
const match = html.match(/DEBUG_COUNT[^0-9]*([0-9]+)/);
console.log(match ? `FOUND: ${match[0]}` : 'NOT FOUND');
