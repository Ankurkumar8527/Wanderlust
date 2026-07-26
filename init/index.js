const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config();

const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

console.log("Loaded token:", process.env.MAP_TOKEN);
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN,
});

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
}

main().then(initDB).catch(console.log);

async function initDB() {
    await Listing.deleteMany({});

    const listings = [];

    for (let obj of initData.data) {
        let response = await geocodingClient.forwardGeocode({
            query: obj.location,
            limit: 1,
        }).send();

        obj.owner = "6a59e7f8e79e9e5ff319d043";
        obj.geometry = response.body.features[0].geometry;

        listings.push(obj);
    }

    await Listing.insertMany(listings);
    console.log("Data initialized");
}