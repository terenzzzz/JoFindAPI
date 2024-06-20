const UMAP = require('umap-js').UMAP;
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs').promises;
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

async function getVecs(modelPath,wordIndexPath){

    // 加载模型
    const model = await loadModel(modelPath);
    // 加载 wordIndex
    const wordIndex = JSON.parse(fs.readFileSync(wordIndexPath, 'utf-8'));
    // 假设model是训练好的Word2Vec模型
    const wordVectors = {};
    const words = Object.keys(wordIndex);
    words.forEach(word => {
        const index = wordIndex[word];
        const vector = model.layers[0].getWeights()[0].arraySync()[index];
        wordVectors[word] = vector;
    });
    return wordVectors
}

async function reduceDimension(modelPath,wordIndexPath) {
    const wordVectors = await getVecs(modelPath,wordIndexPath)
    const vectors = Object.values(wordVectors);
    const words = Object.keys(wordVectors);
    const umap = new UMAP({nComponents: 2});
    const embedding = umap.fit(vectors);

    const result = { embedding, words };
    fs.writeFileSync('reducedData.json', JSON.stringify(result));

    return result;
}

async function reduceDimension(modelPath,wordIndexPath) {
    const wordVectors = await getVecs(modelPath,wordIndexPath)
    const vectors = Object.values(wordVectors);
    const words = Object.keys(wordVectors);
    const umap = new UMAP({nComponents: 2});
    const embedding = umap.fit(vectors);

    const result = { embedding, words };
    fs.writeFileSync('reducedData.json', JSON.stringify(result));

    return result;
}

async function getReduceDimension() {
    const fileContent = await fs.readFile('reducedData.json', 'utf8');
    const data = JSON.parse(fileContent);
    return data;
}
// reduceDimension("model_2024-06-20","wordIndex_2024-06-20.json")

module.exports = { 
    reduceDimension,
    getReduceDimension
 };