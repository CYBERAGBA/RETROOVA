const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/controllers/infoController.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix 'how-it-works' titles
content = content.replace(
    "fr: ['Comment ça marche ? | RETROOVA',",
    "fr: ['Comment ça marche ?',"
);

content = content.replace(
    "en: ['How does it work? | RETROOVA',",
    "en: ['How does it work?',"
);

// Fix 'help' titles  
content = content.replace(
    "fr: ['Centre d'aide RETROOVA',",
    "fr: ['Centre d'aide',"
);

content = content.replace(
    "en: ['RETROVA Help Center',",
    "en: ['Help Center',"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Titles fixed successfully');
