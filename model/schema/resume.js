const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;

// 定义 desiredJob、workExperience、projectExperience、education 和 language 的子 schema
const desiredJobSchema = new Schema({
    // 根据你的需求，定义 desiredJob 里的字段
    role: { type: String, required: true },
    location: { type: String, required: true },
    salaryFrom: { type: Number, required: true },
    salaryTo: { type: Number, required: true },
});
  
const workExperienceSchema = new Schema({
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    performance: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    isIntern: { type: Boolean, required: true },
});

const projectExperienceSchema = new Schema({
    title: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    performance: { type: String, required: true },
    url: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
});

const educationSchema = new Schema({
    college: { type: String, required: true },
    degree: { type: String, required: true },
    major: { type: String, required: true },
    rank: { type: String, required: false, default:"/" },
    course: { type: String, required: true },
    schoolExperience: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true  },
});

const languageSchema = new Schema({
    language: { type: String, required: true },
    proficiency: { type: String, required: true },
    certificate: { type: String, required: true },
    mark: { type: String, required: true },
});

// 定义 resume 的 schema
const resumeSchema = new Schema({
    avatar: { type: String, required: false },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    birth: { type: String, required: true },
    email: { type: String, required: true },
    topDegree: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    selfEvaluation: { type: String, required: true },
    desiredJobs: [desiredJobSchema],
    workExperiences: [workExperienceSchema],
    projectExperiences: [projectExperienceSchema],
    educationExperiences: [educationSchema],
    languageExperience: [languageSchema]
});



module.exports = {
    Resume: mongoose.model('Resume', resumeSchema)
}