const express = require("express");
const router = express.Router();
const wrapAsync =  require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOnwer,validateListing } = require("../middleware.js");


// Index Route
router.get("/",
    wrapAsync(async (req,res)=>{
    const allListings =  await Listing.find({});
        res.render("listings/index.ejs",{allListings})
}));

// New Route 
router.get("/new",isLoggedIn ,(req,res)=>{
     res.render("listings/new.ejs");
});

// Show Route 
router.get("/:id", 
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate : {
    path:"author",
    },
})
    .populate("owner");
   if (!listing) {
    req.flash("error", "Listing does not exist in the database");
     res.redirect("/listings");
};
console.log(listing);
res.render("listings/show.ejs", { listing });
}));

// Create Route 
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(
    async (req,res,next)=>{
    const newListing =new Listing(req.body.listing);
    newListing.owner =  req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
    }));
;
// Edit Route 
router.get("/:id/edit", isLoggedIn,isOnwer,
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
    req.flash("error", "Listing does not exist in the database");
    return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));
//Update Route 
router.put("/:id",
    isLoggedIn,
    isOnwer,
    validateListing,
    wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updates Created");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id",isLoggedIn,isOnwer, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deleteitem = await Listing.findByIdAndDelete(id);
    // console.log(deleteitem);
    req.flash("success","Listing Deleted Created");
    res.redirect("/listings");
}));

module.exports=router;