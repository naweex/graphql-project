const { default: mongoose } = require("mongoose");

mongoose.connect('mongodb://localhost:27017/graphql').then(() => {
    console.log("connected to DB.");
}).catch(err => {
    console.log(err?.message ?? "Failed DB connection");
})

