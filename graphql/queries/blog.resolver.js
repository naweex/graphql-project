const { GraphQLList, GraphQLString } = require("graphql")
const { BlogModel } = require("../models/blogModel")
const { BlogType } = require("../typeDefs/blog.type")

const BlogResolver = {
    type : new GraphQLList(BlogType),
    args : {
        category : {type : GraphQLString}
    },
    resolve : async (_, args) => {
        const {category} = args
        const findQuery = category? {category} : {}
        return await BlogModel.find(findQuery).populate([
            {path : 'author'}, 
            {path: "category"}, 
            {path: "comments.user"}, 
            {path: "comments.answers.user"},
            {path: "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ]);
    }
}
module.exports = {
    BlogResolver
}