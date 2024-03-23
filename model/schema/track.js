const mongoose = require('mongoose');




module.exports = {
    Device: mongoose.model('Device', deviceSchema)
}