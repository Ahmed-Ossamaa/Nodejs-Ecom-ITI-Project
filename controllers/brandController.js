const Brand = require("../models/brandModel")
const slugify = require("slugify")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")


//get all brands (get method)
exports.getBrands = asyncHandler(async (req, res, next) => {
    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await Brand.countDocuments();
    //get all brands
    const brands = await Brand.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });
    //response
    res.status(200).json({
        page, //the current page number
        totalPages: Math.ceil(total / limit), //total number of pages
        totalResults: total, //total number of all results
        limit, //number of results per page
        result: brands.length,  //number of results in current page (total results -limit for last page)
        data: brands
    });

});

//get Brand by id (get method)
exports.getBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const brand = await Brand.findById(id)
    if (!brand) {
        return next(new ApiError(`Brand not found`, 404));
    }
    res.status(200).json({ data: brand })
})

//edit brand by id (patch method)
exports.editBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    const brand = await Brand.findByIdAndUpdate(
        id, //find by id
        { name, slug: slugify(name) }, //update the name and slug
        { new: true } // return after update
    );

    if (!brand) {
        return next(new ApiError(`Brand not found`, 404));
    }
    res.status(200).json({ data: brand })
})

//delete brand by id (delete method)
exports.deleteBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const brand = await Brand.findByIdAndDelete(id)
    if (!brand) {
         return next(new ApiError(`Brand not found`, 404));
    }
    res.status(204).send()
})





// asyncHandler(async(req, res) => {}) or req, res, next
exports.createBrand = asyncHandler(async (req, res , next) => {
    const {name} = req.body
    const brand = await Brand.create({
        name, //can be name:name
        slug: slugify(name) 
    })
    res.status(201).json({ data: brand })

})

