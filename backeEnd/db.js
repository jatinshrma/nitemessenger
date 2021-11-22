require('dotenv').config();
const mongoose = require('mongoose');
const mgurl = process.env.MONGOURI;

mongoose.set('useFindAndModify', false);
const connectToMongo = () => {
    mongoose.connect(mgurl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, ()=>{
        console.log('Conncted to Mongo successfully');
    })
}

module.exports = connectToMongo;