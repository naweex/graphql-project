const createHttpError = require("http-errors");
const { UserModel } = require("../graphql/models/users");
const {SECRET_KEY} = require('../secret_key')
const JWT = require('jsonwebtoken')
function getToken(headers){
    const [bearer , token]= headers?.authorization?.split(' ') || []
    if(token && ['Bearer' , 'bearer'].includes(bearer)) return token;
    throw createHttpError.Unauthorized('unauthorized user account for login')
}
async function verifyAccessTokenInGraphql(req , res){
try {
    const token = getToken(req.headers)
       const {mobile} = JWT.verify(token , SECRET_KEY)
       const user = await UserModel.findOne({mobile} , {password : 0 , otp : 0})
        if(!user) throw createHttpError.Unauthorized('not found any account')
          return user
        } catch (error) {
            throw new createHttpError.Unauthorized()
        }

    }
    module.exports = {
        verifyAccessTokenInGraphql ,
        getToken    
    }