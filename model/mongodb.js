const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
require('dotenv').config()


/* Schemas */
const {User} = require("./schema/user");


/* Variables */
let connected = false;
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${process.env.MONGO_CONNECTION}`);
    connected = true;
});


/* User Function */
const getUser = async (id) => {
    try {
        const user = await User.findOne({_id: id}).populate("tags.tag");
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

const updateSpotifyRefreshToken = async (id, token) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { spotify_refresh_token: token },
            { new: true } // 返回更新后的文档
          );
      
          if (!updatedUser) {
            throw new Error('User not found');
          }
          return updatedUser;
    } catch (error) {
        console.log(error);
    }
};

const updateUserTags = async (id, tags) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { tags: tags },
            { new: true } // 返回更新后的文档
          );
      
          if (!updatedUser) {
            throw new Error('User not found');
          }
          return updatedUser.populate("tags.tag");
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getUser,
    getUsers,
    getUserByEmail,
    addUser,
    updateSpotifyRefreshToken,
    updateUserTags,
}

