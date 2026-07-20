import fs from 'fs'; // For ES Modules

function deleteBeforeElement(fileURLToPath, targetElement) {
    try {
        const data = fs.readFileSync(fileURLToPath, 'utf-8');
        const targetIndex = data.indexOf(targetElement) + targetElement.length;
        if (targetIndex === -1) {
            console.log('Target element not found');
            return;
        }

        const cleanedData = data.slice(targetIndex);
        return cleanedData;
    }
    catch (error) {
        console.error('Error precessing file:', error.message);

    }
}

function readInHtmlTemplate(fileURLToPath) {
    try {
        const data = fs.readFileSync(fileURLToPath, 'utf-8');
        return data;
        //console.log(cleanedData);
    }
    catch (error) {
        console.error('Error precessing file:', error.message);

    }
}

function writeHTMLToDisk(htmlCode) {
    try {
        fs.writeFileSync("./build/xml2csv.html", htmlCode, 'utf-8');
    } catch (error) {
        console.log('Error processing file:', error.message);
    }
}

const jsToInsert = deleteBeforeElement("./xml2csv.js", "<cut-here>");

//let htmlCode = `<!DOCTYPE html><html><head><title>My Page</title><script></script></head><body><h1>Hello World</h1></body></html>`;
let htmlCode = readInHtmlTemplate("./xml2csvtemplate.html")


//const jsToInsert = "console.log('Injected code executed!');";

let updatedHtml = htmlCode.replace(/<script>([\s\S]*?)<\/script>/, `<script>${jsToInsert}<\/script>`);
writeHTMLToDisk(updatedHtml);
//console.log(updatedHtml);