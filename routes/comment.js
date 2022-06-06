const express = require('express');
const commentRouter = express.Router();
const checkAuth = require('../middleware/check-auth');

const {createComment,createCommentReply,voteComment,voteCommentReply,retrieveComments} =require('../controller/commentcontroller');

commentRouter.post('/:postId', checkAuth, createComment);
commentRouter.post('/:commentId/vote', checkAuth, voteComment);


commentRouter.post('/:parentCommentId/reply', checkAuth, createCommentReply);
commentRouter.post('/:commentReplyId/replyVote',checkAuth,voteCommentReply)

commentRouter.get('/:postId/:offset/:exclude',checkAuth,retrieveComments);

module.exports = commentRouter;
