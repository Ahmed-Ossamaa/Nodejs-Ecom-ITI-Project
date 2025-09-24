const mongoose = require("mongoose");

const dbConnection = () => {
    //connect to mongodb
    mongoose.connect(process.env.Db_URI).then((con) => {
        console.log(`Database connected: ${con.connection.host}`);
    })
    .catch((err) => {
        console.log(`Database connection error: ${err}`)
        process.exit(1);
    });

}

module.exports = dbConnection