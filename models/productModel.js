const mongoose = require("mongoose");;

const sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "One Size"],
    },
    qty: {
        type: Number,
        required: true,
        min: 0,
    },
});

const stockSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    sizes: [sizeSchema],
});

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
            minLength: [3, "Product title must be at least 3 characters"],
            maxLength: [50, "Product title must be at most 50 characters"],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: "Brand",
            required: [true, "Brand is required"],
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minLength: [20, "Product description must be at least 20 characters"],
            maxLength: [500, "Product description must be at most 500 characters"],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 1, // 0.1 = 10%, 0.5 = 50%, etc.
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        stock: [stockSchema],
        material: {
            type: String,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        offers: [
            {
                type: String,
            },
        ],
        sold: {
            type: Number,
            default: 0,
            min: 0,
        },
        ratingQty: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        subCategory: {
            type: mongoose.Schema.ObjectId,
            ref: "SubCategory",
            required: [true, "SubCategory is required"],
        },
        seller: {
            type: mongoose.Schema.ObjectId,
            ref: "Seller",
            required: [true, "Product must have a seller"]
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, // ensures virtuals appear in API responses
        toObject: { virtuals: true },
    }
);

//Virtual field for discounted price
productSchema.virtual("finalPrice").get(function () {
    return this.price - this.price * this.discount;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
