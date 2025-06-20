import express from 'express'
import cors from 'cors'
import bootstrap from './src/app.controller.js';

const app=express();
const port=+process.env.PORT||3000;
app.get("/", (req, res) => res.send("this is for Last branch Toaa Commit Hash b6c16e9a696c4d96878ec6b0f457838e92e703e5"));
app.use(cors());
bootstrap(app,express)
app.listen(port,(error)=>{
    if(error) console.log(error)
        else console.log(`server running on port: ${port}`);  
    });