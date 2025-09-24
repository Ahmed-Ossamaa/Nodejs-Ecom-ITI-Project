const SubCategory = require("../models/subCategoryModel")
const slugify = require("slugify")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")



exports.setCatIdtoBody = (req, res, next) => {
    if(!req.body.category){ req.body.category = req.params.categoryId} 
    next();
}


// asyncHandler package for error handling instead of try catch
// should be used later in central error handler
// asyncHandler(async(req, res) => {}) or req, res, next
exports.createSubCategory = asyncHandler(async (req, res) => {  
    const {name, category} = req.body
    const subCategory = await SubCategory.create({
        name, //can be name:name
        slug: slugify(name), // My Subcategory will be converted to my-subcategory
        category,
    })
    res.status(201).json({ data: subCategory })

})

exports.createFilteredObj = (req, res, next) => {
    let filteredObj={};
    if(req.params.categoryId)  filteredObj = {category: req.params.categoryId};
    req.filteredObj = filteredObj;
    next();
}


//get all Subcategories (get method)
exports.getSubCategories = asyncHandler(async (req, res, next) => {
    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await SubCategory.countDocuments();


    //get all categories
    const subCategories = await SubCategory.find(req.filteredObj)
    .skip(skip).limit(limit)
    .sort({ createdAt: -1 })
    .populate({path: "category", select: "name"}); //refer to parent "category" model and select only name of category
    //response
    res.status(200).json({
        page, //the current page number
        totalPages: Math.ceil(total / limit), //total number of pages
        totalResults: total, //total number of all results
        limit, //number of results per page
        result: subCategories.length,  //number of results in current page (total results -limit for last page)
        data: subCategories
    });

});

//get Subcategory by id (get method)
exports.getSubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const subCategory = await SubCategory.findById(id).populate({path: "category", select: "name"});
    if (!subCategory) {
        return next(new ApiError(`SubCategory not found`, 404));
    }
    res.status(200).json({ data: subCategory })
})

//edit SubCategory by id (patch method)
exports.editSubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { name , category} = req.body
    const subCategory = await SubCategory.findByIdAndUpdate(
        id, //find by id
        { name, slug: slugify(name) , category }, //update the name and slug
        { new: true } // return after update
    );

    if (!subCategory) {
        return next(new ApiError(`SubCategory not found`, 404));
    }
    res.status(200).json({ data: subCategory })
})

//delete subCategory by id (delete method)
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const subCategory = await SubCategory.findByIdAndDelete(id)
    if (!subCategory) {
        return next(new ApiError(`SubCategory not found`, 404));
    }
    res.status(204).send()
})


