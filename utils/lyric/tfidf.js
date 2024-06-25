const natural = require('natural');
const {normalisation} = require('../lyric/normalizor')
const TfIdf = natural.TfIdf;
const {full_lyric, full_lyric2,full_lyric3,full_lyric4} = require('../lyric/sampleData')
const fs = require('fs');
const mongodb = require("../../model/mongodb");

// TF 值越高，表示该词语在当前文档中出现的频率越高，即在当前文档中更为重要或者更具有代表性。
// IDF 表示一个词语在文档集合中的稀有程度
// TF-IDF 值越高，表示该词语在当前文档中的重要性越高，并且在整个文档集合中具有更好的区分能力。

const lyrics = [
    full_lyric,
    full_lyric2,
    full_lyric3,
    full_lyric4
];

// ========================= nature TF-IDF =====================================

function calculateTFIDF(lyrics) {
    const tfidf = new TfIdf();
    try {
        // 添加文档并计算TF-IDF
        lyrics.forEach(lyric => {
            const normalizedLyric = normalisation(lyric,false); // 假设 normalisation 函数能正确处理
            tfidf.addDocument(normalizedLyric);
        });
        const vocabulary = tfidf.listTerms(0 /* document index */);
        return tfidf
    } catch (error) {
        console.error('计算TF-IDF时出现错误:', error);
    }
}

function calculateKeywords(tfidf,document) {
    // 提取关键词
    const keywords = [];

    tfidf.listTerms(document).forEach(term => {
        keywords.push({
            term: term.term,
            tfidf: term.tfidf
        });
    });

    // 根据 TF-IDF 值排序关键词
    keywords.sort((a, b) => b.tfidf - a.tfidf);

    return keywords
}


// ========================= Log TF-IDF =====================================
function calculateTFIDF_log(lyrics) {
    const documents = lyrics.map(lyric => (normalisation(lyric, false)));
    const totalDocs = documents.length;
    const termDocCount = {}; // 词语在多少个文档中出现过
    const tfidfValues = [];

    // 计算词频（TF）
    const tfValues = documents.map(doc => {
        const tf = {};
        doc.forEach(term => {
            if (!tf[term]) tf[term] = 0;
            tf[term]++;
        });
        return tf;
    });

    // 计算词语在多少个文档中出现过（文档频率 DF）
    documents.forEach(doc => {
        const seenTerms = new Set();
        doc.forEach(term => {
            if (!seenTerms.has(term)) {
                seenTerms.add(term);
                if (!termDocCount[term]) termDocCount[term] = 0;
                termDocCount[term]++;
            }
        });
    });

    // 计算TF-IDF
    documents.forEach((doc, docIndex) => {
        const tfidf = {};
        Object.keys(tfValues[docIndex]).forEach(term => {
            const tf = tfValues[docIndex][term] / doc.length; // 词频
            const idf = Math.log((totalDocs + 1) / (termDocCount[term] + 1)) + 1; // 平滑后的逆文档频率
            tfidf[term] = tf * idf;
        });
        tfidfValues.push(tfidf);
    });

    return tfidfValues;
}

function calculateKeywords_log(tfidfResults, documentIndex, limit = 10) {
    // 提取特定文档的 TF-IDF 值
    const tfidf = tfidfResults[documentIndex];
    
    // 根据 TF-IDF 值排序关键词
    const sortedTerms = Object.keys(tfidf).sort((a, b) => tfidf[b] - tfidf[a]);
    
    // 创建一个包含关键词及其 TF-IDF 值的数组
    const keywords = sortedTerms.map(term => ({
        term: term,
        tfidf: tfidf[term]
    }));
    
    // 返回限制数量的关键词
    return keywords.slice(0, limit);
}

function saveTFIDFToFile(tfidf, filename) {
    fs.writeFile(filename, JSON.stringify(tfidf, null, 2), (err) => {
        if (err) {
            console.error('Error saving TF-IDF results to file:', err);
        } else {
            console.log(`TF-IDF results saved to ${filename}`);
        }
    });
}

// ========================= Interface =====================================
async function train(){
    const tracks = await mongodb.getAllTracks();
    let corpus = [];
    console.log("Preparing corpus...");
    tracks.forEach(track => {
        corpus.push(track.lyric)
    });
    console.log("Calculating tfidf...");
    const tfidf = calculateTFIDF_log(corpus)
    saveTFIDFToFile(tfidf, 'tfidf_results.json');
    console.log("Saved result to tfidf_results.json");
    return tfidf;
}

// train()



// 调用函数进行计算
// const calculated_tfidf = calculateTFIDF(lyrics);
// const calculated_log_tfidf = calculateTFIDF_log(lyrics);
// console.log(calculated_log_tfidf);
// const keywords = calculateKeywords(calculated_tfidf, 0)
// const log_keywords = calculateKeywords_log(calculated_log_tfidf, 0, 10)
// console.log(log_keywords);
 






