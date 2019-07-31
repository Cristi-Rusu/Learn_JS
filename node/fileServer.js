/* eslint-disable no-throw-literal */

const { createServer } = require('http');
const { parse } = require('url');
const { resolve: resolvePath, sep } = require('path');
const { createReadStream, createWriteStream } = require('fs');
const {
    stat, readdir, mkdir, rmdir, unlink,
} = require('fs').promises;
const mime = require('mime');

const baseDirectory = process.cwd();
function urlPath(url) {
    const { pathname } = parse(url);
    // remove the '/' character from the beginning
    const path = resolvePath(decodeURIComponent(pathname).slice(1));
    if (path !== baseDirectory && !path.startsWith(baseDirectory + sep)) {
        throw { status: 403, body: 'Forbidden' };
    }
    return path;
}

// wrapper function to await the transmission of data
function pipeStream(from, to) {
    return new Promise((resolve, reject) => {
        from.on('error', reject);
        to.on('error', reject);
        to.on('finish', resolve);
        from.pipe(to);
    });
}

// stores functions to handle HTTP methods
const methods = Object.create(null);
// return a list(string) of files in the directory(if it's a folder) or the file's content
methods.GET = async function GET(request) {
    const path = urlPath(request.url);
    let stats;
    try {
        stats = await stat(path);
    } catch (err) {
        // 'ENOENT' means the file doesn't exist
        if (err.code !== 'ENOENT') throw err;
        return { status: 404, body: 'File not found' };
    }
    if (stats.isDirectory()) {
        // return a list of files in the directory separated by newline
        return {
            body: (await readdir(path)).join('\n'),
        };
    }
    return {
        body: createReadStream(path),
        type: mime.getType(path),
    };
};
methods.DELETE = async function DELETE(request) {
    const path = urlPath(request.url);
    let stats;
    try {
        stats = await stat(path);
    } catch (err) {
        // 'ENOENT' means the file doesn't exist
        if (err.code !== 'ENOENT') throw err;
        // 204 code means 'No content'; the request response doesn't contain any data
        // is used to inform that the operation is complete
        return { status: 204 };
    }
    if (stats.isDirectory()) await rmdir(path);
    else await unlink(path);
    return { status: 204 };
};
methods.PUT = async function PUT(request) {
    const path = urlPath(request.url);
    await pipeStream(request, createWriteStream(path));
    return { status: 204 };
};
methods.MKCOL = async function MKCOL(request) {
    const path = urlPath(request.url);
    await mkdir(path);
    return { status: 204 };
};

async function notAllowed(request) {
    return {
        status: 405,
        body: `Method ${request.method} not allowed`,
    };
}

createServer((request, response) => {
    const handler = methods[request.method] || notAllowed;
    handler(request)
        .catch((err) => {
            if (err.status != null) return err;
            // status 500 stands for server error
            return { status: 500, body: String(err) };
        })
        .then(({ status = 200, body, type = 'text/plain' }) => {
            response.writeHead(status, { 'Content-Type': type });
            if (body && body.pipe) body.pipe(response);
            else response.end(body);
        });
}).listen(8000);
