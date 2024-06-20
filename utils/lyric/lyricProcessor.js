
// Input: lyric text
// Output: lyric features
const compromise = require('compromise');
const natural = require('natural');

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


// 2. Feature Extraction: Word2Vec
// 利用 Word2Vec 技术来计算音乐的歌词向量，并将这些向量保存到数据库中。
// 在推荐时，根据用户查询的音乐歌词向量和数据库中存储的歌曲歌词向量进行相似度计算，从而实现歌曲推荐功能。
// 确保在实际应用中适当调整参数和优化算法，以提高推荐的准确性和用户体验。

const tf = require('@tensorflow/tfjs-node');
// 创建训练数据

// 该函数接受一个歌词语料库 corpus，每条歌词表示为一个单词数组。
// 对于每个单词，它找到距离该单词不超过 windowSize 的上下文单词对。
// 这些单词对被用作输入和目标值对，以训练 Word2Vec 模型。
// 函数返回输入张量、标签、词汇表等数据。
function createTrainingData(corpus) {
    const windowSize = 2; //每个目标单词选择上下文单词时的窗口大小
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

// 创建并训练模型
// 该函数使用 createTrainingData 获取训练数据。
// 它创建一个顺序模型，包括 Embedding 层、Flatten 层和 Dense 层。
// 使用分类交叉熵损失函数和 Adam 优化器编译模型。
// 在输入和标签上训练模型 10 个 epochs。
async function trainWord2Vec(corpus) {
    const { inputs, labels, vocabSize } = createTrainingData(corpus);

    const model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 50, inputLength: 1 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });

    await model.fit(inputs, labels, { epochs: 10 });

    await model.save('file://trained_model');

    return model;
}

function getSongVector(songLyrics, model, wordIndex) {
    const words = normalisation(songLyrics);
    const vectors = words.map(word => {
        if (wordIndex[word] !== undefined) {
            return model.predict(tf.tensor2d([wordIndex[word]], [1, 1])).dataSync();
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

// Training
const fs = require('fs');
const {lyric_sample,lyric_sample2,lyric_sample3,lyric_sample4} = require('../lyric/sampleData')
const mongodb = require("../../model/mongodb");
const { log } = require('console');

// 获取Tracks
async function getTracks() {
    try {
        return await mongodb.getTracks();
    } catch (e) {
        return e.message;
    }
};

(async () => {
    try {
        console.log("Getting Tracks from MongoDB...");
        const tracks = await getTracks();
        let corpus = [];
        console.log("Got Tracks, Processing corpus");
        tracks.forEach(track => {
            if(track.lyric){
                corpus.push(normalisation(track.lyric));
            }
            
        });
        console.log("Got corpus, Training Word2Vec Model");
        await trainWord2Vec(corpus)
        console.log("Finished Training");
        return
    } catch (e) {
        console.error(e);
    }
})();



// trainWord2Vec(corpus).then(model => {
//     const { wordIndex } = createTrainingData(corpus);
//     const songVector = getSongVector(lyric_sample4, model, wordIndex);

//     // 保存到数据库的示例代码（这里用 JSON 文件模拟数据库）
//     const database = { "song1": songVector };
//     fs.writeFileSync('database.json', JSON.stringify(database), 'utf-8');
//     console.log('Song vector saved to database.json');
// });


