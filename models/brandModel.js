const mongoose = require("mongoose");
//schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Brand name is required"],
        unique: [true, "Brand name must be unique"],
        trim: true,
        minLength: [3, "Brand name must be at least 3 characters"],
        maxLength: [20, "Brand name must be at most 20 characters"]
    },
    slug:{
        type: String,
        lowercase: true
    },
    image: {
        type: String
    }
}, {timestamps: true});

//model
const Brand = mongoose.model("Brand", brandSchema); 
module.exports = Brand