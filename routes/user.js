const jwtValidation=require('../middleware/check-auth')
const userController=require('../controller/user.controller')
const express = require("express");
const router = express.Router();
const multer  = require('multer')

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

router.get("/:id",jwtValidation,userController.getUserDetail)

router.post("/signup",upload.single('imagepath'),userController.signupUser)

router.post("/login",userController.signInUser)

router.delete(":/id",jwtValidation,userController.deleteUser)

router.get("",jwtValidation,userController.getAllUserRetrieval)

module.exports=router