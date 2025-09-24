const express = require("express");
const router = express.Router();

// Import validation schemas and middleware
const {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    paginationSchema
} = require("../validators/productValidator");
const { protect, restrictTo } = require("../controllers/authController");
const { validateBody, validateParams, validateQuery } = require("../middlewares/validationMiddleware");
const  restrictToOwner  = require("../middlewares/restrictToOwner");
const { checkCategoryExists, checkSubCategoryExists, checkBrandExists } = require("../middlewares/checkEistance");
// Import controller functions
const {
    getProducts,
    createProduct,
    getProduct,
    editProduct,
    deleteProduct
} = require("../controllers/productController");
const Product = require("../models/productModel");



// Routes (anyone can see products , only loged-in admin and seller can create, update )
router.route("/")
    .get(validateQuery(paginationSchema), getProducts)
    .post(protect, restrictTo("admin", "seller"), validateBody(createProductSchema), checkCategoryExists, checkSubCategoryExists, checkBrandExists, createProduct);

//only loged in users   
router.use(protect)
//only admin and seller can edit and delete byid (loged in users can search by id)
router.route("/:id")
    .get(validateParams(productIdSchema), getProduct)
    .patch(
        restrictTo("seller"),
        restrictToOwner(Product, "id", "seller"), // only admin and sellers can delete their own products
        validateParams(productIdSchema),
        validateBody(updateProductSchema),
        editProduct
    )
    .delete(
        restrictTo("admin", "seller"),
        restrictToOwner(Product, "id", "seller"),// only admin and sellers can delete their own products
        validateParams(productIdSchema), 
        deleteProduct
    );

module.exports = router;