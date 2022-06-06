const path  =require("path");
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post');
const userRoutes=require('./routes/user')
const commentRouter=require('./routes/comment')
const app = express();



app.use(express.static(path.join(__dirname,'images')))
mongoose.connect('mongodb+srv://root:UJqeimYA1XPBrYWA@clustertest.bb1xp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{useNewUrlParser: true , useUnifiedTopology: true})
  .then(()=>{
    console.log('connected to database!');
  })
  .catch((err)=>{
    console.log(err)
    console.log('connection failed! ');
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images" , express.static(path.join("images")));

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With ,Content-Type,Authorization ,Accept",
      "HTTP/1.1 200 OK",
      "append,delete,entries,foreach,get,has,keys,set,values,Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,DELETE,OPTIONS,PUT"
    );
    //console.log('request-->',req)
    next();
});

app.use("/api/post",postRoutes);
app.use("/api/user",userRoutes)
app.use("/api/comment",commentRouter)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
  module.exports = app;