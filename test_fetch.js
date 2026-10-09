async function main() {
  const res = await fetch('http://localhost:3000/my-courses');
  const text = await res.text();
  console.log(text.substring(0, 1000));
  const fs = require('fs');
  fs.writeFileSync('output.html', text);
}

main();
