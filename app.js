const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const MONGO_URL ="mongodb://127.0.0.1:27017/Wanderlust";
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const cookieParser = require("cookie-parser");

main()
.then(()=>{
    console.log("conneced to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

const sessionOptions = {
    secret : "mysupersecretcode",
    resave:false,
    saveUninitialized : true,
    cookie:{
        expires : Date.now()+1000*60*60*24*3,
        maxAge : 1000*60*60*24*3,
        httpOnly : true
    },
};


app.get("/",(req,res)=>{
    console.log("Hi, I am root"); 
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeuser = new User({
//         email:"studentxyz@gmail.com",
//         username:"Delta-student100"
//     });
//     let registeredUser = await User.register(fakeuser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Some error occured"}=err;
    res.status(statusCode).render("errors.ejs",{message});
});

app.listen(8080,()=>{
    console.log("Server is listening...");
});
