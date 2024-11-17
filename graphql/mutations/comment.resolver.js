const { GraphQLString } = require("graphql");
const createHttpError = require("http-errors");
const { VerifyAccessTokenInGraphQL } = require("../../middlewares/verifyAccessToken");
const { BlogModel } = require("../models/blogModel");
const {StatusCodes: HttpStatus} = require("http-status-codes");
const { ResponseType } = require("../typeDefs/public.types");
const { copyObject } = require("../utils");
const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../models/course");
const { ProductModel } = require("../models/products");
const { checkExistCourse, checkExistProduct, checkExistBlog } = require("../utils");
const CreateCommentForBlog = {
    type: ResponseType,
    args : {
        comment: {type: GraphQLString},
        blogID: {type: GraphQLString},
        parent: {type: GraphQLString},
    },
    resolve : async (_, args, context) => {
        const {req} = context;
         const user = await VerifyAccessTokenInGraphQL(req)
        const {comment, blogID, parent} = args
        if(!mongoose.isValidObjectId(blogID)) throw createHttpError.BadGateway("blog ID is not correct")
        await checkExistBlog(blogID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(BlogModel, parent)
            if(commentDocument && !commentDocument?.openToComment) throw createHttpError.BadRequest("submit a comment is not allowed")
            const createAnswerResult = await BlogModel.updateOne({
                "comments._id": parent
            }, {
                $push: {
                    "comments.$.answers": {
                        comment,
                        user: user._id,
                        show: false,
                        openToComment: false
                    }
                }
            });
            if(!createAnswerResult.modifiedCount) {
                throw createHttpError.InternalServerError("comment not registered")
            }
            return {
                statusCode: HttpStatus.CREATED,
                data : {
                    message: "your comment submitted successfully"
                }
            }
        }else{
            await BlogModel.updateOne({_id: blogID}, {
                $push : {comments : {
                    comment, 
                    user: user._id, 
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode: HttpStatus.CREATED,
            data : {
                message: "comment submitted , wait for registration"
            }
        }
    }
}
const CreateCommentForProduct = {
    type: ResponseType,
    args : {
        comment: {type: GraphQLString},
        productID: {type: GraphQLString},
        parent: {type: GraphQLString},
    },
    resolve : async (_, args, context) => {
        const {req} = context;
         const user = await VerifyAccessTokenInGraphQL(req)
        const {comment, productID, parent} = args
        if(!mongoose.isValidObjectId(productID)) throw createHttpError.BadGateway("product ID is not correct")
        await checkExistProduct(productID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(ProductModel, parent)
            if(commentDocument && !commentDocument?.openToComment) throw createHttpError.BadRequest("you cant submit a comment")
            const createAnswerResult = await ProductModel.updateOne({
                _id: productID,
                "comments._id": parent
            }, {
                $push: {
                    "comments.$.answers": {
                        comment,
                        user: user._id,
                        show: false,
                        openToComment: false
                    }
                }
            });
            if(!createAnswerResult.modifiedCount) {
                throw createHttpError.InternalServerError("failed to submit a comment")
            }
            return {
                statusCode: HttpStatus.CREATED,
                data : {
                    message: "your comment submitted successfully"
                }
            }
        }else{
            await ProductModel.updateOne({_id: productID}, {
                $push : {comments : {
                    comment, 
                    user: user._id, 
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode: HttpStatus.CREATED,
            data : {
                message: "comment submitted successfully after registration submitted in website"
            }
        }
    }
}
const CreateCommentForCourse = {
    type: ResponseType,
    args : {
        comment: {type: GraphQLString},
        courseID: {type: GraphQLString},
        parent: {type: GraphQLString},
    },
    resolve : async (_, args, context) => {
        const {req} = context;
         const user = await VerifyAccessTokenInGraphQL(req)
        const {comment, courseID, parent} = args
        if(!mongoose.isValidObjectId(courseID)) throw createHttpError.BadGateway("course ID is not correct")
        await checkExistCourse(courseID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(CourseModel, parent)
            if(commentDocument && !commentDocument?.openToComment) throw createHttpError.BadRequest("submit a comment is not allowed")
            const createAnswerResult = await CourseModel.updateOne({
                "comments._id": parent
            }, {
                $push: {
                    "comments.$.answers": {
                        comment,
                        user: user._id,
                        show: false,
                        openToComment: false
                    }
                }
            });
            if(!createAnswerResult.matchedCount && !createAnswerResult.modifiedCount) {
                throw createHttpError.InternalServerError("submit a comment failed")
            }
            return {
                statusCode: HttpStatus.CREATED,
                data : {
                    message: "your answer submitted successfully"
                }
            }
        }else{
            await CourseModel.updateOne({_id: courseID}, {
                $push : {comments : {
                    comment, 
                    user: user._id, 
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode: HttpStatus.CREATED,
            data : {
                message: "comment submitted successfully after registration submitted in website"
            }
        }
    }
}

async function getComment(model, id){
    const findedComment =  await model.findOne({"comments._id": id},  {"comments.$" : 1});
    const comment = copyObject(findedComment)
    if(!comment?.comments?.[0]) throw createHttpError.NotFound("there is no comment with this details")
    return comment?.comments?.[0]
}
module.exports = {
    CreateCommentForBlog,
    CreateCommentForCourse,
    CreateCommentForProduct
}