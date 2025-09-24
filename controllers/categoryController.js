const Category = require("../models/categoryModel")
const slugify = require("slugify")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")


//get all categories (get method)
exports.getCategories = asyncHandler(async (req, res, next) => {
    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await Category.countDocuments();
    //get all categories
    const categories = await Category.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });
    //response
    res.status(200).json({
        page, //the current page number
        totalPages: Math.ceil(total / limit), //total number of pages
        totalResults: total, //total number of all results
        limit, //number of results per page
        result: categories.length,  //number of results in current page (total results -limit for last page)
        data: categories
    });

});

//get category by id (get method)
exports.getCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findById(id)
    if (!category) {
        return next(new ApiError(`Category not found`, 404));
    }
    res.status(200).json({ data: category })
})

//edit category by id (patch method)
exports.editCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    const category = await Category.findByIdAndUpdate(
        id, //find by id
        { name, slug: slugify(name) }, //update the name and slug
        { new: true } // return after update
    );

    if (!category) {
        return next(new ApiError(`Category not found`, 404));
    }
    res.status(200).json({ data: category })
})

//delete category by id (delete method)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) {
        return next(new ApiError(`Category not found`, 404));
    }
    res.status(204).send()
})




// asyncHandler package for error handling instead of try catch
// should be used later in central error handler
// asyncHandler(async(req, res) => {}) or req, res, next
exports.createCategory = asyncHandler(async (req, res , next) => {
    const {name} = req.body
    const category = await Category.create({
        name, //can be name:name
        slug: slugify(name) // My Category will be converted to my-category
    })
    res.status(201).json({ data: category })

})

