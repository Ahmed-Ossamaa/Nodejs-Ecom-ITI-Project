const mongoose = require("mongoose");
//schema
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "SubCategory name is required"],
        unique: [true, "SubCategory name must be unique"],
        trim: true,
        minLength: [2, "SubCategory name must be at least 2 characters"],
        maxLength: [20, "SubCategory name must be at most 20 characters"]
    },
    //A  B  will be converted after slash to ==>ecom.com/a-b
    slug:{
        type: String,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Subcategory must belong to a Category"]
    }


}, {timestamps: true});

//model
const subCategory = mongoose.model("SubCategory", subCategorySchema); // can add 3rd parameter for collection name and override default collection name which will be categories (lowercase, pruralized)
module.exports = subCategory