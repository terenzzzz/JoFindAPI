const { Worker } = require('worker_threads');
const os = require('os');
const mongodb = require("../../model/mongodb");
const fs = require('fs').promises;
const path = require('path');
const cliProgress = require('cli-progress');

async function train() {
    const tracks = await mongodb.getAllTracks();
    let corpus = [];
    
    const preparingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    console.log("Preparing corpus....");
    preparingBar.start(tracks.length, 0);
    
    tracks.forEach((track, index) => {
        corpus.push(track.lyric);
        preparingBar.update(index + 1);
    });
    preparingBar.stop();

    const numCPUs = os.cpus().length;
    const chunkSize = Math.ceil(corpus.length / numCPUs);
    const workers = [];
    const results = [];

    console.log("Calculating TF-IDF...");
    const calculatingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    calculatingBar.start(numCPUs, 0);

    for (let i = 0; i < numCPUs; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, corpus.length);
        const workerData = corpus.slice(start, end);

        const worker = new Worker(path.join(__dirname, 'tfidf_worker.js'), { workerData });
        workers.push(worker);

        worker.on('message', (result) => {
            results.push(result);
            calculatingBar.increment();
            if (results.length === numCPUs) {
                calculatingBar.stop();
                console.log("Merging results and saving...");
                const finalResult = mergeTFIDFResults(results);
                saveTFIDFToFile(finalResult, 'tfidf_results.json');
                console.log("Saved result to tfidf_results.json");
            }
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    }
}

function mergeTFIDFResults(results) {
    const finalResult = {};
    results.forEach((result, index) => {
        Object.keys(result).forEach(term => {
            if (!finalResult[term]) {
                finalResult[term] = new Array(results.length * result[term].length).fill(0);
            }
            result[term].forEach((value, i) => {
                finalResult[term][index * result[term].length + i] = value;
            });
        });
    });
    return finalResult;
}

async function saveTFIDFToFile(tfidf, filename) {
    try {
        await fs.writeFile(filename, JSON.stringify(tfidf, null, 2));
        console.log(`TF-IDF results saved to ${filename}`);
    } catch (err) {
        console.error('Error saving TF-IDF results to file:', err);
    }
}

train().catch(console.error);