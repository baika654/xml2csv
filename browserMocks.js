import { JSDOM } from 'jsdom';
import fs from 'fs'; // For ES Modules

export class DOMParser {
    constructor() { }

    parseFromString(xmlString, type) {
        return new JSDOM(xmlString, { contentType: type }).window.document;
    }

}

const HTMLString = '<div class="upload-card"><h2>Upload Files</h2> \
        <p>Upload your documents here to process them securely.</p> \
                <div class="drop-zone" id="dropZone"> \
            <span class="icon">📥</span> \
            <span class="drop-text">Drag & drop files here or <span class="browse-btn">browse</span></span> \
            <input type="file" id="fileInput" class="file-input" multiple> \
        </div> \
        <div class="file-list" id="fileList"></div> \
    </div>';

export const window = new JSDOM(HTMLString).window;

//let document = window.document;
window.document.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Document was clicked!');
    // 'event.target' refers to the clicked element
    console.log("URL that points to file to download: ", event.target.getAttribute('href'));
    console.log("Name of the file to download: ", event.target.getAttribute('download'));
    const xmlFileName = event.target.getAttribute('download');
    const csvFileName = xmlFileName.replace(/\.[^/.]+$|$/, `.${"csv"}`)
    console.log(xmlFileName.replace(/\.[^/.]+$|$/, `.${"txt"}`));
    fetch(event.target.getAttribute('href')).then((response) => {
        if (response.ok) {
            response.blob().then((blobObject) => {
                blobObject.arrayBuffer().then((arrayBuffer) => {
                    // Wrap the ArrayBuffer inside a Node.js Buffer
                    const buffer = Buffer.from(arrayBuffer);

                    // Write the file synchronously or asynchronously to disk
                    fs.writeFileSync(csvFileName, buffer);
                });
            });
        }
    });
});