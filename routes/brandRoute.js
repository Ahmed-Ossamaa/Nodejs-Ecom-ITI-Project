const express = require("express");
const router = express.Router();

// Import validation schemas and middleware
const {
    createBrandSchema,
    updateBrandSchema,
    brandIdSchema,
    paginationSchema
} = require("../validators/brandValidator");

const { validateBody, validateParams, validateQuery } = require("../middlewares/validationMiddleware");

// Import controller functions
const {
    getBrands,
    createBrand, 
    getBrand,
    editBrand,
    deleteBrand
} = require("../controllers/brandController");

// Routes
router.route("/")
    .get(validateQuery(paginationSchema), getBrands)
    .post(validateBody(createBrandSchema), createBrand);

router.route("/:id")
    .get(validateParams(brandIdSchema), getBrand)
    .patch(
        validateParams(brandIdSchema),
        validateBody(updateBrandSchema),
        editBrand
    )
    .delete(validateParams(brandIdSchema), deleteBrand);

module.exports = router;