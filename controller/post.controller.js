const mongoose=require('mongoose')
const Post=require('../models/post')
const User= require('../models/user')

exports.findAll=(req,res,next)=>{
    Post.find()
        .then(documents=>{
            res.status(200)
                .json({
                    message : 'success',
                    posts :documents
                })
        })
        .catch(error=>{
            console.log(error)
            res.status(400)
                .json({
                    message : error,
                    sales :documents
                })
        })
}

exports.createdpost= (req, res,next) => {
    const userid = req.body.userid;
     // Validate request
     if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    if(!userid){
        res.status(400).send({
            message: "user-id can not be empty!"
        });
        return;
    }
  const promise = User.findById({_id:userid}).exec()
   
   promise.then(authorData=>{
    console.log('filePath',req.file)
    // Create a Course
    return new Post({
        name: req.body.name,
        description: req.body.description,
        imagepath: req.file.path,
        author:authorData._id
    });
   }).then((post)=>{
    console.log('post-->',post)

    Post.create(post)
    .then(data=>{
        res.status(200)
        .json({
            message : 'success',
            post :data
        })
     })
     .catch(error=>{
        res.status(400)
        .json({
            message : 'fail',
            error: error
        })
     })

   });
   
}


exports.find=(req,res,next)=>{
    const postid=req.params.id
    Post.findById(postid,(err,data)=>{

        res.status(200)
            .json({
                message : 'success',
                post :data
            })
    }).catch((err)=>{
        res.status(400)
        .json({
            message : 'fail',
            error: error.body
        })
    })
}

exports.deletePost=(req,res,next)=>{
    const postid=req.params.id
     Post.deleteOne({ _id:postid }).then(result => {
        console.log(result);
        res.status(200).json({ message: 'Post deleted!' });
      })
      .catch((error)=>{
        res.status(400)
        .json({
            message : 'fail',
            error: error.body
        })
      });
}

exports.updatePost=(req,res,next)=>{
    const postid=req.params.id


    let imagePath = req.body.imagepath;
    if(req.file){
      const url =req.protocol + '://' + req.get("host");
      imagePath =url + "/images/" + req.file.filename;
    }

    const post = new Post({
        _id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        imagepath: imagePath
      });
     Post.updateOne({ _id:postid },post).then(result => {
        console.log(result);
        res.status(200).json({ message: "Update Successful !" });
      })
      .catch((error)=>{
        console.log(error)
        res.status(400)
        .json({
           
            message : 'fail',
            error: error.body
        })
      });
}