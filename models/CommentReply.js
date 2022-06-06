const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentReplySchema = new Schema({
  parentComment: {
    type: Schema.ObjectId,
    ref: 'Comment',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  message: String,
  author: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});


CommentReplySchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      await mongoose.model('CommentReplyVote').create({ comment: this._id });
      next();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const commentReplyModel = mongoose.model('CommentReply', CommentReplySchema);
module.exports = commentReplyModel;
