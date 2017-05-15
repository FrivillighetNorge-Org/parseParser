const iconv = require('iconv-lite');
const multiparty = require('multiparty');

function createStreamReaderPromise(part) {
    let targetBuffer = Buffer.alloc(0);
    return new Promise((resolve, reject) => {
        part.on('data', dataBuffer => {
            targetBuffer = Buffer.concat(
                [targetBuffer, dataBuffer],
                dataBuffer.length + targetBuffer.length
            );
        });
        part.on('end', () => {
            resolve({ buffer: targetBuffer, name: part.name });
        });
        part.on('error', reject);
    });
}

function findCharsets(parts) {
    const charsetsResult = parts.find(part => part.name === 'charsets');
    const charsetsJSON = charsetsResult.buffer.toString('UTF-8');
    return JSON.parse(charsetsJSON.trim());
}

function createPartParser(parts, charsets) {
    return name => {
        const part = parts.find(part => part.name === name);
        return iconv.decode(part.buffer, charsets[name] || 'utf-8');
    };
}

module.exports = req => {
    return new Promise((resolve, reject) => {
        const form = new multiparty.Form({
            autoFiles: false
        });
        form.parse(req);

        const partStreamPromises = [];
        form.on('part', part => {
            partStreamPromises.push(createStreamReaderPromise(part));
        });
        form.on('close', () => {
            Promise.all(partStreamPromises)
                .then(parts => {
                    const charsets = findCharsets(parts);
                    const parsePart = createPartParser(parts, charsets);
                    resolve({
                        html: parsePart('html'),
                        text: parsePart('text'),
                        to: parsePart('to'),
                        from: parsePart('from'),
                        subject: parsePart('subject'),
                        headers: parsePart('headers')
                    });
                })
                .catch(reject);
        });
    });
};
