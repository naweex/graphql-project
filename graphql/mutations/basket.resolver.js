const { GraphQLString, GraphQLInt } = require("graphql");
const { ProductModel } = require("../models/products");
const { ResponseType } = require("../typeDefs/public.types");
const {StatusCodes: HttpStatus} = require("http-status-codes");
const { VerifyAccessTokenInGraphQL } = require("../../middlewares/verifyAccessToken");
const { CourseModel } = require("../models/course");
const { checkExistCourse, checkExistProduct } = require("../utils");
const { UserModel } = require("../models/users");
const { copyObject } = require("../utils");
const createHttpError = require("http-errors");
const AddProductToBasket = {
    type: ResponseType,
    args : {
        productID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {productID} = args
        await checkExistProduct(productID)
        const product = await findProductInBasket(user._id, productID)
        if(product){
            await UserModel.updateOne(
                {
                _id: user._id,
                "basket.products.productID" : productID
                },
                {   
                    $inc: {
                        "basket.products.$.count": 1
                    }
                }
            )
        }else{
            await UserModel.updateOne(
                {
                _id: user._id
                },
                {   
                    $push: {
                        "basket.products": {
                            productID,
                            count: 1
                        }
                    }
                }
            )
        }
        return {
            statusCode: HttpStatus.OK,
            data: {
                message: "product added to shopping list"
            }
        }
    }
}
const AddCourseToBasket = {
    type: ResponseType,
    args : {
        courseID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {courseID} = args
        await checkExistCourse(courseID)
        const course = await findCourseInBasket(user._id, courseID)
        if(course){
            throw createHttpError.BadRequest("this course already added to shopping list")
        }else{
            await UserModel.updateOne(
                {
                _id: user._id
                },
                {   
                    $push: {
                        "basket.courses": {
                            courseID,
                            count: 1
                        }
                    }
                }
            )
        }
        return {
            statusCode: HttpStatus.OK,
            data: {
                message: "course added to shopping list"
            }
        }
    }
}
const RemoveProductFromBasket = {
    type: ResponseType,
    args : {
        productID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {productID} = args
        await checkExistProduct(productID)
        const product = await findProductInBasket(user._id, productID)
        let message;
        if(!product) throw createHttpError.NotFound("product not found in shopping list")
        if(product.count > 1){
            await UserModel.updateOne(
                {
                _id: user._id,
                "basket.products.productID" : productID
                },
                {   
                    $inc: {
                        "basket.products.$.count": -1
                    }
                }
            )
            message = "one product decrease in shopping list"
        }else{
            await UserModel.updateOne(
                {
                    _id: user._id,
                    "basket.products.productID" : productID
                },
                {   
                    $pull: {
                        "basket.products": {
                            productID,
                        }
                    }
                }
                )
                message = "product deleted in shopping list"
        }
        return {
            statusCode: HttpStatus.OK,
            data: {
                message
            }
        }
    }
}
const RemoveCourseFromBasket = {
    type: ResponseType,
    args : {
        courseID: {type: GraphQLString}
    },
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {courseID} = args
        await checkExistCourse(courseID)
        const userCourse = await UserModel.findOne({_id: user._id, Courses: courseID})
        if(userCourse) throw new createHttpError.BadRequest("this course already bought")
        const course = await findCourseInBasket(user._id, courseID)
        if(!course) throw createHttpError.NotFound("course not found in shopping list")
        if(course.count > 1){
            await UserModel.updateOne(
                {
                _id: user._id,
                "basket.courses.courseID" : courseID
                },
                {   
                    $inc: {
                        "basket.courses.$.count": -1
                    }
                }
            )
            message = "one product decrease in shopping list"
        }else{
            await UserModel.updateOne(
                {
                _id: user._id,
                "basket.courses.courseID" : courseID
                },
                {   
                    $pull: {
                        "basket.courses": {
                            courseID,
                        }
                    }
                }
            )
            message = "product deleted in shopping list"
        }
        return {
            statusCode: HttpStatus.OK,
            data: {
                message
            }
        }
    }
}
async function findProductInBasket(userID, productID){
    const findResult = await UserModel.findOne({_id: userID, "basket.products.productID": productID}, {"basket.products.$": 1})
    const userDetail = copyObject(findResult);
    return userDetail?.basket?.products?.[0]
}
async function findCourseInBasket(userID, courseID){
    const findResult = await UserModel.findOne({_id: userID, "basket.courses.courseID": courseID}, {"basket.courses.$": 1})
    const userDetail = copyObject(findResult);
    return userDetail?.basket?.courses?.[0]
}
module.exports = {
    AddCourseToBasket,
    AddProductToBasket,
    RemoveCourseFromBasket,
    RemoveProductFromBasket
}