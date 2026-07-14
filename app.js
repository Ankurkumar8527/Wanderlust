const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const MONGO_URL ="mongodb://127.0.0.1:27017/Wanderlust";
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.get("/getcookies",(req,res)=>{
    res.cookie("Greet","Hello");
    res.send("Get cookies");
})

app.get("/",(req,res)=>{
    console.log("Hi, I am root"); 
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


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
