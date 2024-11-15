const express = require('express')
const { createHandler } = require("graphql-http/lib/use/express")
const app = express()
const { graphQLSchema } = require('./graphql/index.graphql')
app.use(express.json());
app.use(express.urlencoded({extended: true}));
require("./graphql/config/mongoose");


app.use('/graphql' , createHandler(function(req , res){
    return {
        schema : graphQLSchema ,
        context : {req , res} ,
    } 
}))

app.listen(3000, () => {
    console.log('server: http://localhost:3000/graphql');
});