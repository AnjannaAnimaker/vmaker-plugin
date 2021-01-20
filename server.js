// Last time updated at June 02, 2017

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// RecordRTC      - github.com/muaz-khan/RecordRTC

// RecordRTC over Socket.io - https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    uuid = require('node-uuid'),
    port = process.argv[2] || 9001;

console.log('http://localhost:' + port);

var app = http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}).listen(parseInt(port, 10));

var path = require('path'),
    exec = require('child_process').exec;
var io = require('socket.io').listen(app);
var BLOBS = [];
var blobs = {}

io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        var fileName = 'uploaded-video'
        console.log("final blob");
        // var finalblob = Buffer.concat(blobs[data['videoId']]);
        // console.log(finalblob)
        // delete blobs[data['videoId']];
        writeToDisk(data['file'].video.dataURL, socket, fileName + '.webm');
    });

    socket.on('blob-send', function (data) {
        console.log("🚀 ~ file: server.js ~ line 71 ~ data", data);
        if(data['videoId'] in blobs){
            blobs[data['videoId']].push(Buffer.from(data['blob']));
		}
		else{
            blobs[data['videoId']] = [];
            blobs[data['videoId']].push(Buffer.from(data['blob']));
		}
    });
});

// isn't it redundant?
// app.listen(8888);

function writeToDisk(dataURL, socket, fileName) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileBuffer;

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer.from(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
    socket.emit('completed', {'fileName':'uploaded-video.webm'});
}

// function merge(socket, fileName) {
//     var FFmpeg = require('fluent-ffmpeg');

//     var audioFile = path.join(__dirname, 'uploads', fileName + '.wav'),
//         videoFile = path.join(__dirname, 'uploads', fileName + '.webm'),
//         mergedFile = path.join(__dirname, 'uploads', fileName + '-merged.webm');

//     new FFmpeg({
//         source: videoFile
//     })
//         .addInput(audioFile)
//         .on('error', function (err) {
//             socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message);
//         })
//         .on('progress', function (progress) {
//             socket.emit('ffmpeg-output', Math.round(progress.percent));
//         })
//         .on('end', function () {
//             socket.emit('merged', fileName + '-merged.webm');
//             console.log('Merging finished !');

//             // removing audio/video files
//             fs.unlinkSync(audioFile);
//             fs.unlinkSync(videoFile);
//         })
//         .saveToFile(mergedFile);
// }
