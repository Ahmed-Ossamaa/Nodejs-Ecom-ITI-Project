const mongoose = require("mongoose");
//schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: [true, "Category name must be unique"],
        trim: true,
        minLength: [3, "Category name must be at least 3 characters"],
        maxLength: [32, "Category name must be at most 32 characters"]
    },
    //A  B  will be converted after slash to ==>ecom.com/a-b
    slug:{
        type: String,
        lowercase: true
    },
    image: {
        type: String
    }
}, {timestamps: true});

//model
const Category = mongoose.model("Category", categorySchema); // can add 3rd parameter for collection name and override default collection name which will be categories (lowercase, pruralized)
module.exports = Category