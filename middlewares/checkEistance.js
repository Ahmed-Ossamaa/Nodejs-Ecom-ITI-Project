const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const Brand = require("../models/brandModel");
const ApiError = require("../utils/apiError");

exports.checkCategoryExists = async (req, res, next) => {
    const { category } = req.body;
    if (category) {
        const cat = await Category.findById(category);
        if (!cat) {
            return next(new ApiError("Category not found", 404));
        }
    }
    next();
};

exports.checkSubCategoryExists = async (req, res, next) => {
    const { subCategory } = req.body;
    if (subCategory) {
        const subCat = await SubCategory.findById(subCategory);
        if (!subCat) {
            return next(new ApiError("SubCategory not found", 404));
        }
    }
    next();
}

exports.checkBrandExists = async (req, res, next) => {
    const { brand } = req.body;
    if (brand) {
        const brands = await Brand.findById(brand);
        if (!brands) {
            return next(new ApiError("Brand not found", 404));
        }
    }
    next();
}