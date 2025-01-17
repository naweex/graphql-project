const { default: mongoose } = require("mongoose");
const { commentSchema } = require("../public.schema");

const productSchema = new mongoose.Schema({
    title : {type : String , required : true} ,
    short_text : {type : String , required : true} ,
    text: {type : String , required : true} ,
    images : {type : [String] , required : true} ,
    tags : {type : [String] , default : []} ,
    category : {type : mongoose.Types.ObjectId ,ref : 'category', required : true} ,
    comments : {type : [commentSchema] , default : []} ,
    likes : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    dislikes : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    bookmarks : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    price : {type : Number , default : 0} ,
    discount : {type : Number , default : 0 } ,
    count : {type : Number } ,
    type : {type : String , required : true} ,
    format : {type : String } ,
    supplier : {type : mongoose.Types.ObjectId , ref : 'users' , required : true} ,
    features : {type : Object , default : {
        length : '' ,
        heigh : '' ,
        width : '' ,
        weight : '' ,
        colors : [] ,
        model : [] ,
        madein : '' ,
    }} ,

})
productSchema.index({title : 'text' ,short_text : 'text' , text : 'text'})
productSchema.virtual('imagesURL').get(function(){
    return this.images.map(image => `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/${image}`)
})
module.exports = {
    ProductModel : mongoose.model('product' , productSchema)
}