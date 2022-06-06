const mongoose=require('mongoose')
const Schema = mongoose.Schema;

const postSchema = Schema({
    name: {type: String, require:true},
    description: {type: String , require:true},
    imagepath: {type: String , require:true},
    date: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: Schema.ObjectId,
      ref: 'User',
    }
  })
  
  module.exports = mongoose.model('Post',postSchema);