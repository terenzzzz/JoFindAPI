const axios = require('axios');
const mongodb = require("../model/mongodb");


exports.getResume = async (req, res) => {
    try{
        let user_id = req.user._id // 使用发起请求的用户id
        const resume = await mongodb.getResume(user_id)
        return res.send({ status: 200, message: 'Success', data: resume})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getResumeByUser = async (req, res) => {
    try{
        let user_id = req.query.user // 使用输入的用户id
        console.log(user_id);
        
        const resume = await mongodb.getResume(user_id)
        return res.send({ status: 200, message: 'Success', data: resume})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};


exports.updateResume = async (req, res) => {
    try{
        // 解析传递的 JSON 字符串
        const { desiredJobs, workExperiences, projectExperiences, educationExperiences, languageExperience, ...otherFields } = req.body;

        // 将 JSON 字符串转换为对象
        const parsedDesiredJobs = JSON.parse(desiredJobs);
        const parsedWorkExperiences = JSON.parse(workExperiences);
        const parsedProjectExperiences = JSON.parse(projectExperiences);
        const parsedEducationExperiences = JSON.parse(educationExperiences);
        const parsedLanguageExperience = JSON.parse(languageExperience);

        const resume = {
            ...otherFields,
            desiredJobs: parsedDesiredJobs,
            workExperiences: parsedWorkExperiences,
            projectExperiences: parsedProjectExperiences,
            educationExperiences: parsedEducationExperiences,
            languageExperience: parsedLanguageExperience,
        };

        let avatarBase64 = req.file ? fileToBase64(req.file) : null;

        const updatedResume = await mongodb.updateResume(req.user._id, resume, avatarBase64) 
        if(updatedResume){
            return res.send({ status: 200, message: 'Success', data: updatedResume})
        }
        return res.send({ status: 1, message: 'Error'})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};



function fileToBase64(file){
    // 从 req.file.buffer 获取文件内容  
  const fileBuffer = file.buffer;  
  
  // 将 Buffer 转换为 Base64 编码的字符串  
  const base64String = fileBuffer.toString('base64');  

  return base64String
}
