const { parentPort, workerData } = require('worker_threads');
const natural = require('natural');
const {normalisation} = require('../lyric/normalizor')

function calculateTFIDF_log(lyrics) {
    const documents = lyrics.filter(lyric => lyric != null)
                            .map(lyric => {
                                if (typeof lyric !== 'string') {
                                    console.error('Non-string lyric:', lyric);
                                    return [];
                                }
                                return normalisation(lyric, false);
                            });
    const totalDocs = documents.length;
    const termDocCount = {};
    const tfidfValues = {};

    documents.forEach((doc, docIndex) => {
        const tf = {};
        const seenTerms = new Set();
        doc.forEach(term => {
            if (!tf[term]) tf[term] = 0;
            tf[term]++;
            if (!seenTerms.has(term)) {
                seenTerms.add(term);
                if (!termDocCount[term]) termDocCount[term] = 0;
                termDocCount[term]++;
            }
        });

        Object.keys(tf).forEach(term => {
            const tfValue = tf[term] / doc.length;
            const idf = Math.log((totalDocs + 1) / (termDocCount[term] + 1)) + 1;
            if (!tfidfValues[term]) tfidfValues[term] = new Array(documents.length).fill(0);
            tfidfValues[term][docIndex] = tfValue * idf;
        });
    });

    return tfidfValues;
}

try {
    const result = calculateTFIDF_log(workerData);
    parentPort.postMessage(result);
} catch (error) {
    console.error('Error in worker:', error);
    parentPort.postMessage({ error: error.message });
}