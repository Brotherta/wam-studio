async function generateSHAHash(file: File) {
    if (!file) {
        console.error('No file selected');
        return;
    }

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        // @ts-ignore
        const md5Hash = await generateSHA(arrayBuffer);
        console.log(`SHA Hash: ${md5Hash}`);
    } catch (error) {
        console.error('Error generating SHA hash', error);
    }
}

function readFileAsArrayBuffer(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            // @ts-ignore
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

async function generateSHA(arrayBuffer: ArrayBuffer) {
    console.log('Generating SHA hash...');
    const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return bufferToHex(digest);
}

function bufferToHex(buffer: ArrayBuffer) {
    const view = new DataView(buffer);
    let hexString = '';

    for (let i = 0; i < view.byteLength; i += 4) {
        const uint32 = view.getUint32(i);
        hexString += uint32.toString(16).padStart(8, '0');
    }

    return hexString;
}