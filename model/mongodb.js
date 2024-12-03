const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
require('dotenv').config()


/* Schemas */
const {User} = require("./schema/user");
const {SeekingStatus} = require("./schema/seekingStatus");
const {Company} = require("./schema/company");
const {Job} = require("./schema/job");
const {Application} = require("./schema/application");
const {Resume} = require("./schema/resume");
const {Chatroom} = require("./schema/chatroom");
const {Message} = require("./schema/message");


/* Variables */
let connected = false;
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${process.env.MONGO_CONNECTION}`);
    connected = true;
});


/* Chat Room */
const createRoom = async (seeker, company) => {
    try {         
        // console.log(seeker, company);
        
        const exist = await Chatroom.findOne({seeker: seeker, company: company})
        if (exist) {
            return exist._id
        } else {
            console.log("Chatroom not found, creating new one...");

            const newChatRoomData = { 
                seeker: seeker,        
                company: company,       
            };
            const newChatRoom = new Chatroom(newChatRoomData); // 创建新的简历
            await newChatRoom.save()
            return newChatRoom._id
        }

    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}


const getChatRoomBySeeker = async (user) => {
    try {         
        return await Chatroom.find({seeker: user}).populate("seeker").populate("company")
    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}

const getChatRoomByCompany = async (user) => {
    try {         
        return await Chatroom.find({company: user}).populate("seeker").populate("company")
    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}

const createMsg = async (chatroom, user, msg) => {
    try {         
        const newMsgData = { 
            chatroom: chatroom,     
            sender: user,      
            message: msg,       
        };
        const newMsg = new Message(newMsgData); // 创建新的简历
        await newMsg.save()
        return newMsg
    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}

const getMsgByChatRoom = async (chatroom) => {
    try {         
      return await Message.find({chatroom: chatroom}).populate('sender')
    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}



/* Resume Function */
const getResume = async (user) => {
    try {         
        return await Resume.findOne({user: user})
    } catch (error) {  
        console.error('Error getResume:', error);  
    }  
}

const updateResume = async (user, resume, avatar) => {
    try {         
        let updatedResume = null;
        const exist = await Resume.findOne({ user: user });

        if (exist) {
            // 如果简历已存在，更新现有的简历
            console.log("Resume exists, updating...");
            
            // 只在 avatar 有数据时才更新 avatar 字段
            const updateData = { ...resume }; // 先把 resume 中的属性合并

            if (avatar !== null && avatar !== undefined && avatar !== "") {
                updateData.avatar = avatar;  // 如果 avatar 有数据，则更新 avatar 字段
            }else{
                updateData.avatar = exist.avatar; 
            }

            // 更新简历
            exist.set(updateData); // 使用 updateData 合并数据
            updatedResume = await exist.save(); // 保存更新后的简历
        } else {
            // 如果简历不存在，创建新简历
            console.log("Resume not found, creating new one...");

            // 只在 avatar 有数据时才添加 avatar 字段
            const newResumeData = { 
                ...resume,        // 将传入的 resume 数据合并
                user: user,       // 用户信息
            };

            if (avatar !== null && avatar !== undefined && avatar !== "") {
                newResumeData.avatar = avatar;  // 如果 avatar 有数据，则添加 avatar 字段
            }

            const newResume = new Resume(newResumeData); // 创建新的简历
            updatedResume = await newResume.save(); // 保存新的简历
        }

        return updatedResume;
        
    } catch (error) {  
        console.error('Error updating resume:', error); 
        throw error;  // 可选择重新抛出错误，或返回某个错误响应
    }  
};

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

const getApplicationByCompany = async (company) => {
    try {         
        const application = await Application.findOne({company: company})
        .populate([
            {
                path: 'job',
                populate: { path: 'company' }
            },
            {
                path: 'user'
            }
        ]);
        // 如果填充成功，遍历 user 字段（假设它是一个数组或单个文档）
        // 并删除每个用户的 password 字段
        if (application && application.user) {
            if (Array.isArray(application.user)) {
                // 如果 user 是一个数组，遍历并删除每个用户的 password
                application.user = application.user.map(user => {
                    const { password, ...rest } = user.toObject(); // 使用 toObject() 确保是普通的 JavaScript 对象
                    return rest;
                });
            } else {
                // 如果 user 是一个单个文档，删除 password 字段
                const { password, ...rest } = application.user.toObject();
                application.user = rest;
            }
        }
        return application
    } catch (error) {  
        console.error('Error getApplicationByCompany:', error);  
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
            const newApplication = { ...application, user: user, step: 1 }; // 同样，这里假设user._id是用户的唯一标识符
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

const updateApplicationClosed = async (application, isClosed) => {
    try { 

        const updatedApplication = await Application.findByIdAndUpdate(
            application,  // 要更新的文档的 ID
            { isClosed },        // 更新的字段和对应的值
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

const getJobById = async (id) => {
    try { 
        return await Job.findById(id).populate("company");
    } catch (error) {  
        console.error('Error Getting Company job:', error);  
    }  
}

const getJobsByRole = async (keyword) => {
    try {
        keyword = keyword? keyword : "" // 确保keyword有值
        // 转义关键词中的特殊字符
        const escapeRegExp = (str) => str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
        const keywords = keyword.toLowerCase().split(/\s+/).map(escapeRegExp);

        // 创建匹配所有关键词的正则表达式
        const regex = new RegExp(keywords.join('.*'), 'i'); // 这里改成 .*，以保证关键词之间能有字符

        // 创建完全匹配的正则表达式
        const exactMatch = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i'); // 完全匹配的正则表达式

        let result = {};

        const aggregatePipeline = [
            { $match: { role: regex } }, // 确保是匹配 role 字段
            { $addFields: {
                exactMatch: {
                    $cond: [
                        { $regexMatch: { input: "$role", regex: exactMatch } },
                        1,
                        0
                    ]
                },
                score: {
                    $cond: [
                        { $regexMatch: { input: "$role", regex: exactMatch } },
                        0,
                        {
                            $reduce: {
                                input: keywords,
                                initialValue: 0,
                                in: {
                                    $add: [
                                        "$$value",
                                        { $indexOfBytes: [ { $toLower: "$role" }, "$$this" ] }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }},
            { $sort: { exactMatch: -1, score: 1 } }, // 排序时，先按照 exactMatch 排序，再按照 score 排序
            { 
                $lookup: {
                    from: 'companies',       // 连接的目标集合
                    localField: 'company',   // 当前集合中的字段（company，存储的是 ObjectId）
                    foreignField: '_id',     // 目标集合中的字段（通常是 _id）
                    as: 'company'           // 将匹配到的文档存入 company 字段
                }
            },
            { 
                $unwind: '$company'        // 展开 company 数组，返回单个文档
            }
        ];

        result = await Job.aggregate(aggregatePipeline)


        return result;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};


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
    getJobById,

    addApplication,
    updateApplicationStep,
    updateApplicationClosed,
    getApplicationByJob,
    getApplicationByUser,
    getApplicationByCompany,

    getResume,
    updateResume,

    getJobsByRole,

    createRoom,
    getChatRoomBySeeker,
    getChatRoomByCompany,
    createMsg,
    getMsgByChatRoom
}

