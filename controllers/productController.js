const Product = require("../models/productModel")
const slugify = require("slugify")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")
const Seller = require("../models/sellerModel")


//get all Products (get method)
exports.getProducts = asyncHandler(async (req, res, next) => {
    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();
    //get all products
    const products = await Product.find({}).skip(skip).limit(limit)
        .sort({ createdAt: -1 })
        .populate({ path: "category", select: "name" });
    //response
    res.status(200).json({
        page, //the current page number
        totalPages: Math.ceil(total / limit), //total number of pages
        totalResults: total, //total number of all results
        limit, //number of results per page
        result: products.length,  //number of results in current page (total results -limit for last page)
        data: products
    });

});

//get product by id (get method)
exports.getProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id).populate({ path: "category", select: "name" })
    if (!product) {
        return next(new ApiError(`Product not found`, 404));
    }
    res.status(200).json({ data: product })
})

//edit product by id (patch method)
exports.editProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (req.body.title) {
        req.body.slug = slugify(req.body.title) //slugify the title
    }

    const product = await Product.findByIdAndUpdate(
        id, //find by id
        req.body, //update and return the whole body
        { new: true } // return after update
    );

    if (!product) {
        return next(new ApiError(`Product not found`, 404));
    }
    res.status(200).json({ data: product })
})

//delete product by id (delete method)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
        return next(new ApiError(`Product not found`, 404));
    }
    res.status(204).send()
})




// asyncHandler package for error handling instead of try catch
// should be used later in central error handler
// asyncHandler(async(req, res) => {}) or req, res, next
exports.createProduct = asyncHandler(async (req, res, next) => {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
        return next(new ApiError("You must have a seller profile to create products", 403));
    }

    // Add slug + seller id to product
    req.body.slug = slugify(req.body.title);
    req.body.seller = seller._id;

    const product = await Product.create(req.body);

    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: product
    });
});

