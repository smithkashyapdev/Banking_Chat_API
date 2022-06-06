const { json } = require("body-parser");
const multer  = require('multer')
const express = require("express");
const router = express.Router();
const postController= require('../controller/post.controller')
const Post=require('../models/post')
const authController=require('../middleware/check-auth')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix+'.png')
  }
})


const upload = multer({ storage: storage })

router.get("",authController,postController.findAll)

router.post("",authController,upload.single('image'),postController.createdpost)//working fine

router.put('/:id',authController,upload.single('image'),postController.updatePost)

router.get("/:id",authController,postController.find)//working fine

router.delete("/:id",authController,postController.deletePost)//working fine



module.exports=router