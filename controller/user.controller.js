const mongoose=require('mongoose');
const User=require('../models/user');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signupUser=(req,res,next)=>{

        // Validate request
        if (!req.body.firstname) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }
        else if (!req.body.password) {
            res.status(400).send({
                message: "Password can not be empty!"
            });
            return;
        }

        bcrypt.hash(req.body.password, 10)
              .then(hash=>{
                const user = new User({
                    firstname: req.body.firstname,
                    lastname:req.body.lastname,
                    password:hash,
                    email: req.body.email,
                    imagepath: req.file.path,
                    contactno:req.body.contactno
                });

                user.save()
                .then(result =>{
                  res.status(201).json({
                    message : 'User created!',
                    result: result
                  });
                })
        
                .catch(err =>{
                  res.status(500).json({
                    error :err
                  });
                });
        
            })

      

}

exports.signInUser=(req,res,next)=>{
    let fetchedUser;
    User.findOne({email: req.body.email}).then(user=>{
      if(!user){
        return res.status(401).json({
          token: "error",
          expiresIn: "error",
          role: "error",
          message: "Invalid Email (user email not registered)"
        });
      }
      fetchedUser=user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result =>{
      if(!result){
        return res.status(401).json({
          token: "error",
          expiresIn: "error",
          role: "error",
          message: "Invalid password please try again"
        });
      }
      const token = jwt.sign(
        {email: fetchedUser.email ,
           userId : fetchedUser ._id } ,
        'this_is_the_webToken_secret_key' ,
        { expiresIn : "1h"}
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId:fetchedUser._id,
          role: fetchedUser.role,
          message: "Logged in Successfully"
        });
    })
    .catch(err =>{
      return res.status(401).json({
        message: "Auth failed"
      });
    });
}

exports.forgotPassword=(req,res,next)=>{

}

exports.updateUser=(req,res,next)=>{
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            firstname: req.body.firstname,
            lastname:req.body.lastname,
            password:hash,
            email: req.body.email,
            imagepath: req.file.path,
            contactno:req.file.contactno
        });
  
      User.updateOne({_id: req.params.id}, user)
    .then(result => {
      console.log(result);
      res.status(200).json({message : "Update user Successful !"});
    })
    .catch(err =>{
      res.status(500).json({
      error :err
     });
  });
  
  })
}

exports.deleteUser=(req,res,next)=>{
    User.deleteOne({ _id: req.params.id }).then(result => {
        console.log(result);
        res.status(200).json({ message: 'user deleted!' });
      });
}

exports.getUserDetail=(req,res,next)=>{
    User.findById(req.params.id).then(user =>{
        if(user){
          res.status(200).json(user);
        }else{
          res.status(200).json({message:'user not found'});
        }
      });
}

exports.getAllUserRetrieval=(_req,res,_next)=>{
  User.find().select(['_id','firstname','email']).then(userlist=>{
    if(userlist){
      res.status(200).json({
        success : true,
        result: userlist
      });
    }else{
      res.status(200).json({message:'user not found'});
    }
  }).catch((err)=>{
    res.status(500).json({
      error :err
    });
  })
}