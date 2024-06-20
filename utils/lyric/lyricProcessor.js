
const compromise = require('compromise');
const natural = require('natural');

// ================================= Pre-Process =============================

// Tokenisation
function tokenisation(lyric) {
    lyric = lyric.toLowerCase();
    lyric = lyric.replace(/[.,\/#!$\[\]%\^&\*;:{}=\-_`~()]/g, ""); //移除所有指定的标点符号。
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
    // 获取内置的英语停用词列表
    const stopWords = new Set(natural.stopwords);
    return tokens.filter(token => !stopWords.has(token.toLowerCase()));
}

// 综合所有步骤
function normalisation(lyric, stem) {
    let result = lyric

    // Tokenisation
    result = tokenisation(lyric);

    // stopword removal
    result = removeStopWords(result);


    if (stem){
        // Stemming
        result = stemming(result);
    }else{
        // Lemmatisation
        result = lemmatisation(result);
    }

    return result;
}



// ================================= Model Training =============================

const tf = require('@tensorflow/tfjs-node');


// 该函数接受一个歌词语料库 corpus，每条歌词表示为一个单词数组。
// 对于每个单词，它找到距离该单词不超过 windowSize 的上下文单词对。
// 这些单词对被用作输入和目标值对，以训练 Word2Vec 模型。
// 函数返回输入张量、标签、词汇表等数据。
function createTrainingData(corpus) { // 创建训练数据
    const windowSize = 4; //每个目标单词选择上下文单词时的窗口大小
    const wordPairs = []; //存储目标单词和上下文单词对 [targetWord, contextWord]
    const vocab = new Set(); //存储整个语料库中出现的所有唯一单词

    // wordPairs Calculation
    corpus.forEach(lyrics => { // 每一首歌的歌词
        lyrics.forEach((word, idx) => { // 歌词中的每个词
            vocab.add(word);
            const start = Math.max(0, idx - windowSize);
            const end = Math.min(lyrics.length, idx + windowSize + 1);

            for (let i = start; i < end; i++) {
                if (i !== idx) {
                    wordPairs.push([word, lyrics[i]]);
                }
            }
        });
    });

    // 这两个映射表被用于在单词和索引值之间进行相互转换。它们共同构成了Word2Vec模型的词汇表。
    const wordIndex = {}; // 将每个单词映射到一个唯一的索引号。
    const indexWord = []; // 将每个索引号映射回对应的单词
    Array.from(vocab).forEach((word, idx) => {
        wordIndex[word] = idx;
        indexWord[idx] = word;
    });

    // 将之前构建的wordPairs(目标单词和上下文单词对的列表)转换为张量形式,作为模型的输入数据
    // 对于每个[targetWord, contextWord]对
    // 分别使用wordIndex将单词映射到对应的索引值
    // 构建一个包含两个索引值的数组,作为该单词对的输入
    const inputs = tf.tensor2d(wordPairs.map(pair => [wordIndex[pair[0]], wordIndex[pair[1]]]));

    // - `inputs.arraySync()`将输入张量转换为JavaScript数组
    // - 对于每个`[targetWordIdx, contextWordIdx]`对,取第二个元素`contextWordIdx`作为标签索引
    // - `tf.oneHot`将这些标签索引转换为对应长度的一热编码向量
    // - `vocab.size`提供了一热编码向量的长度,等于词汇表的大小
    const labels = tf.oneHot(inputs.arraySync().map(pair => pair[1]), vocab.size);

    // inputs.gather([0], 1): 这个操作是为了让输入张量的形状符合模型的要求,具体来说,它将输入张量的第二个维度(对应单词对)移动到第一个维度,以满足嵌入层的输入要求
    return { inputs: inputs.gather([0], 1), labels, wordIndex, indexWord, vocabSize: vocab.size };
}



async function trainWord2Vec(corpus) { // 创建训练模型
    // 使用 createTrainingData 获取训练数据。
    const { inputs, labels, wordIndex, vocabSize } = createTrainingData(corpus);

    // 创建一个顺序模型，包括 Embedding 层、Flatten 层和 Dense 层。
    const model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 100, inputLength: 1 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });

    model.summary();

    // 在输入和标签上训练模型 10 个 epochs。
    await model.fit(inputs, labels, { epochs: 15 });


    // // 保存模型
    const filePath = `model_${toDate()}`;
    await model.save(`file://${filePath}`); 
    console.log(`Done! Saved Model Path: ${filePath}`);

    // 保存 wordIndex 到文件
    fs.writeFileSync(`wordIndex_${toDate()}.json`, JSON.stringify(wordIndex));
    console.log(`Done! Saved wordIndex Path: wordIndex_${toDate()}.json`);

    return model;
}

function getSongVector(songLyrics, model, wordIndex) {
    const words = normalisation(songLyrics);
    const embeddingLayer = model.layers[0]; // 获取 Embedding 层

    const vectors = words.map(word => {
        if (wordIndex[word] !== undefined) {
            const wordTensor = tf.tensor2d([wordIndex[word]], [1, 1]);
            const embedding = embeddingLayer.apply(wordTensor); // 直接获取嵌入向量
            return embedding.dataSync(); // 获取嵌入向量的值
        } else {
            return null;
        }
    }).filter(vector => vector !== null);

    if (vectors.length === 0) {
        return null;
    }

    // 计算平均向量
    let meanVector = vectors[0];
    for (let i = 1; i < vectors.length; i++) {
        meanVector = meanVector.map((val, index) => val + vectors[i][index]);
    }
    meanVector = meanVector.map(val => val / vectors.length);

    return meanVector;
}


// 定义读取模型的方法
async function loadModel(path) {
    try {
        const model = await tf.loadLayersModel(`file://${path}/model.json`);
        console.log('Model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading the model:', error);
        throw error; // 重新抛出错误，以便调用方可以处理
    }
}

async function findSimilarWords(word, model, wordIndex) {
    const wordIdx = wordIndex[word];
    if (wordIdx === undefined) {
        console.error(`Word "${word}" not found in the word index.`);
        return [];
    }

    const embeddingLayer = model.layers[0];

    // 获取词的嵌入向量
    const wordVector = embeddingLayer.apply(tf.tensor2d([wordIdx], [1, 1])).dataSync();

    // 计算其他词与目标词的相似度
    const similarities = {};
    for (const otherWord in wordIndex) {
        if (otherWord !== word) {
            const otherWordIdx = wordIndex[otherWord];
            const otherWordVector = embeddingLayer.apply(tf.tensor2d([otherWordIdx], [1, 1])).dataSync();
            const similarity = calculateCosineSimilarity(wordVector, otherWordVector);
            similarities[otherWord] = similarity;
        }
    }

    // 按相似度排序
    const sortedSimilarities = Object.entries(similarities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // 取前10个最相似的词

    return sortedSimilarities;
}

function calculateCosineSimilarity(vector1, vector2) {
    const dotProduct = vector1.reduce((acc, val, idx) => acc + val * vector2[idx], 0);
    const norm1 = Math.sqrt(vector1.reduce((acc, val) => acc + val * val, 0));
    const norm2 = Math.sqrt(vector2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (norm1 * norm2);
}



// ================================= Interface =============================
const fs = require('fs');
const mongodb = require("../../model/mongodb");
const { log } = require('console');
const { toDate } = require('../today');

function extractKeywords(lyric){
    // 获取关键词数组
    const keywordsArray = normalisation(lyric);
    // 转换成 Set 以去除重复项
    const keywordsSet = new Set(keywordsArray);
    // 返回 Set
    return keywordsSet;
}

async function train(){
    try {
        console.log("Getting Tracks from MongoDB...");
        const tracks = await mongodb.getTracks();
        let corpus = [];
        console.log("Processing corpus...");
        tracks.forEach(track => {
            if(track.lyric){
                corpus.push(normalisation(track.lyric));
            }
            
        });
        console.log("Training Word2Vec Model...");
        await trainWord2Vec(corpus)
        return    
    } catch (e) {
        return e.message;
    }
}

async function getLyricVec(modelPath,wordIndexPath,lyric) {
    // 加载模型
    const model = await loadModel(modelPath);

    // 加载 wordIndex
    const wordIndex = JSON.parse(fs.readFileSync(wordIndexPath, 'utf-8'));

    const songVector = await getSongVector(lyric, model, wordIndex);
    console.log(songVector);
    return songVector
}

async function getSimilarWords(modelPath,wordIndexPath,word) {
    // 加载模型
    const model = await loadModel(modelPath);
    // 加载 wordIndex
    const wordIndex = JSON.parse(fs.readFileSync(wordIndexPath, 'utf-8'));

    const words = findSimilarWords(word, model, wordIndex);
    console.log(words);
    return words
}

const {lyric_sample} = require("../lyric/sampleData")
// train()
// getSimilarWords("model_2024-06-20", "wordIndex_2024-06-20.json", "scar")
// getLyricVec("model_2024-06-20", "wordIndex_2024-06-20.json", lyric_sample)


module.exports = {
    extractKeywords,
    train,
    getLyricVec
};






