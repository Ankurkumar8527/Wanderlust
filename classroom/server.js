const express =  require("express");
const app = express();
// const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(session({
    secret : "mysupersecretstring", 
    resave:false,
    saveUninitialized : true,
})
);

app.get("/reqcount",(req,res)=>{
    if(req.session.count)   req.session.count++;
    else req.session.count = 1;
    res.send(`You sent a request ${req.session.count} times`);
})

// app.get("/test",(req,res)=>{
//     res.send("test successfull");
// });

app.listen(3000,()=>{
    console.log("server is listein to 3000");
})