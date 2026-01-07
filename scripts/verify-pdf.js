const fs = require('fs');
const pdf = require('pdf-parse');

try {
    const dataBuffer = fs.readFileSync('node_modules/pdf-parse/test/data/01-valid.pdf');
    console.log("Reading PDF...");
    pdf(dataBuffer).then(function (data) {
        console.log("Success! PDF Text Length:", data.text.length);
        console.log("Preview:", data.text.substring(0, 50));
    }).catch(function (error) {
        console.error("PDF Parse Error:", error);
        process.exit(1);
    });
} catch (e) {
    console.error("Setup Error:", e);
    process.exit(1);
}
