const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
require('dotenv').config()


/* Schemas */
const {User} = require("./schema/user");
const {SeekingStatus} = require("./schema/seekingStatus");
const {Company} = require("./schema/company");
const {Job} = require("./schema/job");
const {Application} = require("./schema/application");

/* Variables */
let connected = false;
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${process.env.MONGO_CONNECTION}`);
    connected = true;
});

/* Application Function */
const getApplicationByUser = async (user) => {
    try {         
        return await Application.find({user: user}).populate({
            path: 'job',
            populate: { path: 'company' }
          });
    } catch (error) {  
        console.error('Error updating job:', error);  
    }  
}


const getApplicationByJob = async (user, job) => {
    try {         
        const existJob = await Application.findOne({user: user, job: job})
        return existJob
    } catch (error) {  
        console.error('Error updating job:', error);  
    }  
}

const addApplication = async (user, application) => {
    try { 
        const exist = await Application.findOne({ user: user, job: application.job }); // 注意：通常user应该是一个对象，这里假设user._id是其唯一标识符
        
        if (exist) {
            console.error('Current user already applied for this job');  
            return null; // 如果已经存在，则返回null
        } else {
            const newApplication = { ...application, user: user, step: 0 }; // 同样，这里假设user._id是用户的唯一标识符
            const addedApplication = new Application(newApplication);
            
            const savedApplication = await addedApplication.save();
            return savedApplication; // 如果保存成功，则返回保存的对象
        }
    } catch (error) {  
        console.error('Error finding or saving application:', error);  
        return null; // 如果在查找或保存过程中发生错误，则返回null
    }
}

const updateApplicationStep = async (application, step) => {
    try { 

        const updatedApplication = await Application.findByIdAndUpdate(
            application,  // 要更新的文档的 ID
            { step },        // 更新的字段和对应的值
            { new: true }    // 返回更新后的文档
        );

        if (!updatedApplication) {
            throw new Error('Application not found');
        }

        // 返回更新后的文档
        return updatedApplication;
        
    } catch (error) {  
        console.error('Error updating job:', error);  
    }  
}




/* Job Function */
const updateJob = async (job) => {
    try { 
        var updatedJob = {}
        
        if (job._id){ // 传入了id, 修改该记录  
            updatedJob = await Job.findOne({ _id: job._id });  
            if (updatedJob) {  
                Object.assign(updatedJob, job);  
                await updatedJob.save();  
                console.log('Job updated successfully');  
            } else {  
                console.error('Job record not found');  
            }
        }else{ // 否则添加一个新的记录 
            updatedJob = Job(job)
            await updatedJob.save()
        }
        return updatedJob
        
    } catch (error) {  
        console.error('Error updating job:', error);  
    }  
}

const getJobsByCompanyId = async (companyId) => {
    try { 
        const jobs = await Job.find({company: companyId}).populate("company");
        return jobs
    } catch (error) {  
        console.error('Error Getting Company job:', error);  
    }  
}

const getJobs = async (companyId) => {
    try { 
        return await Job.find().populate("company");
    } catch (error) {  
        console.error('Error Getting Company job:', error);  
    }  
}

const deleteJob = async (jobId) => {
    try { 
        return await Job.deleteOne({_id: jobId});
    } catch (error) {  
        console.error('Error Getting Company job:', error);  
    }  
}




/* Company Function */
const updateCompany = async (id, company) => {
    try { 
        var updatedCompany = {}
        
        if (company._id){
           // 传入了id, 修改该记录  
            updatedCompany = await Company.findOne({ _id: company._id });  
            if (updatedCompany) {  
                Object.assign(updatedCompany, company);  
                await updatedCompany.save();  
                console.log('Company updated successfully');  
            } else {  
                console.error('Company record not found');  
            }
        }else{
            console.log("no ID");
            
            // 没有传入id， 新建company记录并更新对于user
            const { _id, ...filteredCompany } = company;

            updatedCompany = Company(filteredCompany)
            await updatedCompany.save()
    
            const user = await User.findOne({_id: id})
            if (user) {  
                // 更新 user 的 company 属性为新 Company 文档的 _id  
                user.company = updatedCompany._id;  
                
                // 保存更新后的 User 文档  
                await user.save();  
                
                console.log('User company saft successfully');  
            } else {  
                console.error('User not found');  
            }  
        }
        return updatedCompany
        
    } catch (error) {  
        console.error('Error updating user company:', error);  
    }  
}

const getCompanyById = async (companyId) => {
    try { 
        console.log(companyId);
        
        return await Company.findById(companyId);
    } catch (error) {  
        console.error('Error Getting Company:', error);  
    }  
}



/* SeekingStatus Function */
const getSeekingStatus = async () => {
    try {
        return await SeekingStatus.find()
    } catch (error) {
        console.log(error);
    }
};


/* User Function */
const getUser = async (id) => {
    try {
        const user = await User.findOne({_id: id}).populate("company");
        const { password, ...userWithoutPassword } = user.toObject();

        return userWithoutPassword;
    } catch (error) {
        console.log(error);
    }
};

const getUsers = async () => {
    try {
        return await User.find().populate("tags.tag");
    } catch (error) {
        console.log(error);
    }
};

const getUserByEmail = async (email) => {
    try {
        return await User.findOne({email: email});
    } catch (error) {
        console.log(error);
    }
};

const addUser = async (user) => {
    try {
        const newUser = User(
            {
                name: user.name,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
                role: user.role
            }
        )
        return await newUser.save()
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getUser,
    getUsers,
    getUserByEmail,
    addUser,

    getSeekingStatus,

    updateCompany,
    getCompanyById,
    deleteJob,

    updateJob,
    getJobsByCompanyId,
    getJobs,

    addApplication,
    updateApplicationStep,
    getApplicationByJob,
    getApplicationByUser
}

