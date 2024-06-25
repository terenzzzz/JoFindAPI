
const compromise = require('compromise');
const natural = require('natural');
const {customStopWords} = require('./stopWords')



// ================================= Pre-Process =============================

// Tokenisation
function tokenisation(lyric) {
    lyric = lyric.toLowerCase();
    lyric = lyric.replace(/[.,\/#!$\[\]%\^&\*;:{}=\-_`~()]/g, ""); //移除所有指定的标点符号。
    lyric = lyric.replace(/\d+/g, ""); // 移除所有数字
    lyric = lyric.replace(/\s{2,}/g, " "); //将两个或更多连续的空白字符替换为一个空格。
    lyric = lyric.trim(); // 去除字符串两端的空格。
    return compromise(lyric).terms().out('array');
}

// Lemmatisation
function lemmatisation(tokens) {
    return tokens.map(token => {
        let doc = compromise(token);
        return doc.nouns().toSingular().out('text') ||
            doc.verbs().toInfinitive().out('text') ||
            token;
    });
}

// Stemming
function stemming(tokens) {
    const stemmer = natural.PorterStemmer;
    return tokens.map(token => stemmer.stem(token));
}

function removeStopWords(tokens) {
    const stopWords = new Set([...natural.stopwords, ...customStopWords]);
    return tokens.filter(token => !stopWords.has(token.toLowerCase()));
}

function removeHighLowFrequencyWords(tokens) {
    // Implement your high and low frequency words removal logic here
    // Example: keep words with frequency between minFreq and maxFreq
    const frequency = {}; // Calculate frequency of each word
    tokens.forEach(token => frequency[token] = (frequency[token] || 0) + 1);
    
    const minFreq = 2;
    const maxFreq = 100;
    
    return tokens.filter(token => frequency[token] >= minFreq && frequency[token] <= maxFreq);
}

// 综合所有步骤
function normalisation(lyric, stem = true) {
    let result = lyric
    if (lyric){
        // Tokenisation
        result = tokenisation(lyric);
    
        // stopword removal
        result = removeStopWords(result);
    
        // result = removeHighLowFrequencyWords(result);
    
        if (stem){
            // Stemming
            result = stemming(result);
        }else{
            // Lemmatisation
            result = lemmatisation(result);
        }
    }
    return result;
}

module.exports = {
    normalisation
};


