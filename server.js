const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
const dbConnection = require("./config/dbConfig");
const ApiError = require("./utils/apiError");
const errorHandler = require("./middlewares/errorMiddleware");
//routes imports
const catRoutes = require("./routes/categoryRoute");
const subCatRoutes = require("./routes/subCategoryRoute");
const brandRoutes = require("./routes/brandRoute");
const productRoutes = require("./routes/productRoute");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");
const sellerRoutes = require("./routes/sellerRoute");
const paymentRoutes = require("./routes/paymentRoute");

//connect to database
dbConnection();

//express app
const app = express();
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

//middleware
app.use(cors())
app.use(express.json());

if (process.env.NODE_ENV == "development") {
    app.use(morgan('dev'))
    console.log(`mode: ${process.env.NODE_ENV}`)
}

//routes
app.use("/api/v1/categories", catRoutes);
app.use("/api/v1/subcategories", subCatRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products",productRoutes );
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);      
app.use("/api/v1/cart", cartRoutes);       
app.use("/api/v1/orders", orderRoutes);  
app.use('/api/v1/payments', paymentRoutes);  
app.use("/api/v1/sellers", sellerRoutes);
    


//handle unhandled routes
app.all(/.*/, (req, res, next) => {//could be app.use((req, res, next) => {})
    next(new ApiError(`Route ${req.originalUrl} not found`, 404));
});

//centralized error handler
app.use(errorHandler)





const port = process.env.PORT || 8000
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

//handle unhandled  rejections outside express
process.on("unhandledRejection", (err) => {
    console.log(`Unhandled-Error: ${err.message}`);


    server.close(() => {
        console.log(`Shutting down the server due to unhandled rejection`);
        process.exit(1);
    })
});

