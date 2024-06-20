

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

async function getVecs(){
    const model = await loadModel(modelPath);
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