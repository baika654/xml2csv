import path from 'node:path';
import EventEmitter from 'node:events';
import fs from 'fs';
//const EventEmitter = require('events');
//const fs = require('fs');


export class FileReader extends EventEmitter {
    static EMPTY = 0;
    static LOADING = 1;
    static DONE = 2;

    constructor() {
        super();
        this.readyState = FileReader.EMPTY;
        this.result = null;
        this.error = null;
    }

    _readFile(file, encoding = null) {
        this.readyState = FileReader.LOADING;

        if (file.path) {
            const filePath = path.join(file.path, file.name)

            fs.readFile(filePath, encoding, (err, data) => {
                if (err) {
                    this.readyState = FileReader.DONE;
                    this.error = err;
                    if (typeof this.onerror === 'function') this.onerror(err);
                    this.emit('error', err);
                    return;
                }

                this.readyState = FileReader.DONE;
                this.result = data;

                if (typeof this.onload === 'function') this.onload({ target: this });
                this.emit('load', { target: this });
            });
        } else {
            file.text().then((value) => {
                this.readyState = FileReader.DONE;
                this.result = value;
                if (typeof this.onload === 'function') this.onload({ target: this });
                this.emit('load', { target: this });
            });
        }
    }

    readAsText(file, encoding = 'utf8') {
        this._readFile(file, encoding);
    }

    readAsDataURL(file) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.readyState = FileReader.DONE;
                this.error = err;
                if (typeof this.onerror === 'function') this.onerror(err);
                this.emit('error', err);
                return;
            }

            // Mimic browser Base64 Data URL
            const mimeType = this._getMimeType(filePath);
            const base64Data = data.toString('base64');
            this.result = `data:${mimeType};base64,${base64Data}`;

            this.readyState = FileReader.DONE;
            if (typeof this.onload === 'function') this.onload({ target: this });
            this.emit('load', { target: this });
        });
    }

    readAsArrayBuffer(file) {
        this._readFile(file, null);
    }

    _getMimeType(file) {
        // Simple MIME type resolver for common formats
        if (file.name.endsWith('.png')) return 'image/png';
        if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) return 'image/jpeg';
        if (file.name.endsWith('.gif')) return 'image/gif';
        if (file.name.endsWith('.svg')) return 'image/svg+xml';
        if (file.name.endsWith('.txt')) return 'text/plain';
        if (file.name.endsWith('.json')) return 'application/json';
        return 'application/octet-stream';
    }
}

//module.exports = FileReader;
