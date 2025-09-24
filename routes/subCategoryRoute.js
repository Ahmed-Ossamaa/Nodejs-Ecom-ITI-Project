const express = require("express");
const router = express.Router({mergeParams: true});

// Import validation schemas and middleware
const { 
    createSubCategorySchema, 
    updateSubCategorySchema, 
    subCategoryIdSchema,
    categoryIdSchema,
    paginationSchema 
} = require("../validators/subCategoryValidator");

const { validateBody, validateParams, validateQuery } = require("../middlewares/validationMiddleware");

// Import controller functions
const {
    setCatIdtoBody, 
    createSubCategory,
    createFilteredObj, 
    getSubCategories, 
    getSubCategory, 
    editSubCategory, 
    deleteSubCategory
} = require("../controllers/subCategoryController");

// Routes
router.route("/")
    .get(
        validateParams(categoryIdSchema),
        validateQuery(paginationSchema),
        createFilteredObj,
        getSubCategories
    )
    .post(
        validateParams(categoryIdSchema),
        setCatIdtoBody,
        validateBody(createSubCategorySchema),
        createSubCategory
    );

router.route("/:id")
    .get(
        validateParams(categoryIdSchema),
        validateParams(subCategoryIdSchema),
        getSubCategory
    )
    .patch(
        validateParams(categoryIdSchema),
        validateParams(subCategoryIdSchema),
        validateBody(updateSubCategorySchema),
        editSubCategory
    )
    .delete(
        validateParams(categoryIdSchema),
        validateParams(subCategoryIdSchema),
        deleteSubCategory
    );

module.exports = router;