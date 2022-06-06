const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/Comment');
const CommentReply=require('../models/CommentReply')
const CommentVote=require('../models/CommentVote')
const CommentReplyVote=require('../models/CommentReplyVote');
const { async } = require('rxjs');
const ObjectId = require('mongoose').Types.ObjectId;


module.exports.createComment = async (req, res, next) => {
    const { postId } = req.params;
    const { message } = req.body;
    const {user_id} =req.body;
    console.log('createComment',req);
    let post = undefined;
    let user =undefined;
    if (!message) {
        return res
          .status(400)
          .send({ error: 'Please provide a message with your comment.' });
      }
      if (!postId) {
        return res.status(400).send({
          error: 'Please provide the id of the post you would like to comment on.',
        });
      }

      if (!user_id) {
        return res.status(400).send({
          error: 'Please provide the user_id of the post you would like to comment on.',
        });
      }

      try {
        console.log('findPost--',postId);
        post = await Post.findById({_id:postId});
        user=await User.findById({_id:user_id});
        console.log('findPost--',user);
        if (!post) {
          return res
            .status(404)
            .send({ error: 'Could not find a post with that post id.' });
        }

        const comment = new Comment({ message, author: user._id, post: postId });
        await comment.save();

       res.status(201).send({
            ...comment.toObject(),
            author: user.toObject(),
            commentVotes: [],
          }); 
      }
      catch(exec){
        next(exec);
      }
}

module.exports.createCommentReply = async (req, res, next) => {
    const { parentCommentId } = req.params;
    const { message } = req.body;
    const {user_id} =req.body;
    console.log('createComment',req);
  
    if (!message) {
        return res
          .status(400)
          .send({ error: 'Please provide a message with your comment.' });
      }
      if (!parentCommentId) {
        return res.status(400).send({
          error: 'Please provide the id of the comment you would like to reply to.',
        });
      }
    

      try {
        console.log('parentCommentId',parentCommentId);
        const comment = await Comment.findById(parentCommentId);
        console.log('comment--',comment);
        const user = await User.findById(user_id);
        if (!comment) {
          return res
            .status(404)
            .send({ error: 'Could not find a parent comment with that id.' });
        }
        const commentReply = await new CommentReply({
          parentComment: parentCommentId,
          message,
          author: user._id,
        });
    
        await commentReply.save();
        res.status(201).send({
          ...commentReply.toObject(),
          author: { username: user.firstname, avatar: user.imagepath },
          commentReplyVotes: [],
        });
      } catch (err) {
        next(err);
      }
    

}

module.exports.voteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const {user_id} =req.body;



  try {
    console.log('param',req.params)
    const user = await User.findById(user_id);
    console.log('user',user)
    console.log('commentId',commentId)
    const commentLikeUpdate = await CommentVote.updateOne(
      {
        comment: commentId,
        'votes.author': { $ne: user._id },
      },
      { $push: { votes: { author: user._id } } }
    );
    if (!commentLikeUpdate.nModified) {
      if (!commentLikeUpdate.ok) {
        return res
          .status(500)
          .send({ error: 'Could not vote on the comment.' });
      }
      // Nothing was modified in the previous query meaning that the user has already liked the comment
      // Remove the user's like
      const commentDislikeUpdate = await CommentVote.updateOne(
        { comment: commentId },
        { $pull: { votes: { author: user._id } } }
      );
      if (!commentDislikeUpdate.nModified) {
        return res
          .status(500)
          .send({ error: 'Could not vote on the comment.' });
      }
    }
    return res.send({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports.voteCommentReply = async (req, res, next) => {
  const { commentReplyId } = req.params;
  const {user_id} =req.body;

  try {
    const user = await User.findById(user_id);
    console.log('user',user)
    const commentReplyLikeUpdate = await CommentReplyVote.updateOne(
      {
        comment: commentReplyId,
        'votes.author': { $ne: user._id },
      },
      { $push: { votes: { author: user._id } } }
    );
    // Nothing was modified in the previous query meaning that the user has already liked the comment
    // Remove the user's like
    if (!commentReplyLikeUpdate.nModified) {
      if (!commentReplyLikeUpdate.ok) {
        return res
          .status(500)
          .send({ error: 'Could not vote on the comment reply.' });
      }
      const commentReplyDislikeUpdate = await CommentReplyVote.updateOne(
        { comment: commentReplyId },
        { $pull: { votes: { author: user._id } } }
      );
      if (!commentReplyDislikeUpdate.nModified) {
        return res
          .status(500)
          .send({ error: 'Could not vote on the comment reply.' });
      }
    }

    return res.send({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports.fetchComment = async (postId, offset, exclude = 0) => {

  try {
    let skips = 2 * (offset - 1)
    return await Comment.aggregate(
      [
        {
          $facet: {
            comments:[
              { $match: { post: ObjectId(postId) } },
              // Sort the newest comments to the top
              { $sort: { date: -1 } },
              { $skip: skips },
              { $limit: 2 },
              {
                $lookup: {
                  from: 'commentreplies',// document name
                  localField: '_id',// comment ID
                  foreignField: 'parentComment',// comment replies id
                  as: 'commentReplies', //as get data
                },
                
              },
              {
                $lookup: {
                  from: 'commentvotes',
                  localField: '_id',
                  foreignField: 'comment',
                  as: 'commentVotes',
                },
              },
              { $unwind: '$commentVotes' },
              {
                $lookup: {
                  from: 'users',
                  localField: 'author',
                  foreignField: '_id',
                  as: 'author',
                },
              },
              { $unwind: '$author' },
              {
                $addFields: {
                  commentReplies: { $size: '$commentReplies' },
                  commentVotes: '$commentVotes.votes',
                },
              },
            ],
            commentCount: [
              {
                $match: { post: ObjectId(postId) },
              },
              { $group: { _id: null, count: { $sum: 0 } } },
            ],
          
          }
        }
      ]
    )
  }
  
  catch(err){
    throw new Error(err);
  }

}

module.exports.retrieveComments =async(req,res,next)=>{

  const { postId, offset, exclude } = req.params;
  console.log('param',postId+'off'+offset+'exc'+exclude)
  try {
    const comments = await this.fetchComment(postId, offset, exclude);
    return res.send(comments);
  } catch (err) {
    next(err);
  }
}