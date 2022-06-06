const mongoose=require('mongoose')
const Followers = require('../models/Followers')
const Following = require('../models/Following')

const RequestError = require('../errorTypes/RequestError');

const userSchema = mongoose.Schema({
    firstname: {type: String, require:true},
    lastname: {type: String, require:true},
    password: {type: String, require:true},
    email: {type: String, require:true},
    imagepath: {type: String , require:true},
    contactno: {type: Number , require:true},
  })
  
  userSchema.pre('save', async function (next) {
    if (this.isNew) {
      try {
        const document = await User.findOne({
          $or: [{ email: this.email }, { contactno: this.contactno }],
        });
        console.log('document--',document)
        if (document)
          return next(
            new RequestError(
              'A user with that email or username already exists.',
              400
            )
          );
        await Followers.create({ user: this._id });
        await Following.create({ user: this._id });
      } catch (err) {
        console.log(err)
        return next((err.statusCode = 400));
      }
    }
  });


const User = mongoose.model('User', userSchema);
module.exports = User;
