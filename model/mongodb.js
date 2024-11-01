const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
require('dotenv').config()


/* Schemas */
const {User} = require("./schema/user");
const {SeekingStatus} = require("./schema/seekingStatus");
const {Company} = require("./schema/company");

/* Variables */
let connected = false;
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${process.env.MONGO_CONNECTION}`);
    connected = true;
});

/* Company Function */
const updateCompany = async (id, company) => {
    try { 
        var updatedCompany = {}
        
        if (company._id !== ""){
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

    updateCompany
}

