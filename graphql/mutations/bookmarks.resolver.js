const { GraphQLString } = require("graphql");
const { ProductModel } = require("../models/products");
const { ResponseType } = require("../typeDefs/public.types");
const {StatusCodes: HttpStatus} = require("http-status-codes");
const { VerifyAccessTokenInGraphQL } = require("../../middlewares/verifyAccessToken");
const { CourseModel } = require("../models/blogModel");
const { BlogModel } = require("../models/blogModel");
const { checkExistBlog, checkExistCourse, checkExistProduct } = require("../utils");

const BookmarkProduct = {
    type: ResponseType,
    args : {
        productID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {productID} = args
        await checkExistProduct(productID)
        let BookmarkedProduct = await ProductModel.findOne({
            _id: productID,
            bookmarks : user._id
        })
        const updateQuery = BookmarkedProduct? {$pull:{bookmarks: user._id}} : {$push: {bookmarks: user._id}}
        await ProductModel.updateOne({ _id: productID }, updateQuery)
        let message
        if(!BookmarkedProduct){ 
            message = "product added to your wishlist"
        } else message = "product removed from your wishlist"
        return {
            statusCode: HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
const BookmarkCourse = {
    type: ResponseType,
    args : {
        courseID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {courseID} = args
        await checkExistCourse(courseID)
        let bookmarkedcourse = await CourseModel.findOne({
            _id: courseID,
            bookmarks : user._id
        })
        const updateQuery = bookmarkedcourse? {$pull:{bookmarks: user._id}} : {$push: {bookmarks: user._id}}
        await CourseModel.updateOne({ _id: courseID }, updateQuery)
        let message;
        if(!bookmarkedcourse){
            message = "product added to your wishlist"
        } else message = "product removed from your wishlist"
        return {
            statusCode: HttpStatus.OK,
            data : {
                message
            }
        }
    }
}
const BookmarkBlog = {
    type: ResponseType,
    args : {
        blogID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {blogID} = args
        await checkExistBlog(blogID)
        let bookmarkedBlog = await BlogModel.findOne({
            _id: blogID,
            bookmarks : user._id
        })
        const updateQuery = bookmarkedBlog? {$pull:{bookmarks: user._id}} : {$push: {bookmarks: user._id}}
        await BlogModel.updateOne({ _id: blogID }, updateQuery)
        let message
        if(!bookmarkedBlog){
            message = "blog added to your wishlist"
        } else message = "blog removed from your wishlist"
        return {
            statusCode: HttpStatus.OK,
            data : {
                message
            }
        }
    }
}
module.exports = {
    BookmarkBlog,
    BookmarkCourse,
    BookmarkProduct
}