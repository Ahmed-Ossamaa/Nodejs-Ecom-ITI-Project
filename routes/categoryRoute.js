const express = require("express");
const router = express.Router();

// Import validation schemas and middleware
const {
    createCategorySchema,
    updateCategorySchema,
    categoryIdSchema,
    paginationSchema
} = require("../validators/categoryValidator");
//validation
const { validateBody, validateParams, validateQuery } = require("../middlewares/validationMiddleware");

// Import controller functions
const {
    getCategories,
    createCategory, 
    getCategory,
    editCategory,
    deleteCategory
} = require("../controllers/categoryController");

const subCategoryRoute = require("./subCategoryRoute");

// Nested route for subcategories
router.use("/:categoryId/subcategories", subCategoryRoute);

// Routes
router.route("/")
    .get(validateQuery(paginationSchema), getCategories)
    .post(validateBody(createCategorySchema), createCategory);

router.route("/:id")
    .get(validateParams(categoryIdSchema), getCategory)
    .patch(
        validateParams(categoryIdSchema),
        validateBody(updateCategorySchema),
        editCategory
    )
    .delete(validateParams(categoryIdSchema), deleteCategory);

module.exports = router;