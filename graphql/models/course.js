const { default: mongoose } = require("mongoose");
const { commentSchema } = require("../public.schema");
const { getTimeOfCourse } = require("../utils"); ref : 'user' ,
const Episode = new mongoose.Schema({
    title : {type : String , required : true} ,
    text : {type : String , required : true} ,
    type : {type : String , default : 'free'} ,
    time : {type : String , required : true} ,
    videoAddress : {type : String , require : true}
} , {toJSON : {virtuals : true}})
Episode.virtual('videoURL').get(function(){
    return `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/${this.videoAddress}`
})
const Chapter = new mongoose.Schema({
    title : {type : String , required : true} ,
    text : {type : String , default : ''} ,
    episodes : {type : [Episode] , default : []} , 
})
const courseSchema = new mongoose.Schema({
    title : {type : String , required : true} ,
    short_text : {type : String , required : true} ,
    text : {type : String , required : true} ,
    image : {type : String , required : true} ,
    tags : {type : [String] , default : []} ,
    category : {type : mongoose.Types.ObjectId ,ref : 'category', required : true} ,
    comments : {type : [commentSchema] , default : []} ,
    likes : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    dislikes : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    bookmarks : {type : [mongoose.Types.ObjectId] , ref : 'user' , default : []} ,
    price : {type : Number , default : 0} ,
    discount : {type : Number , default : 0 } ,
    type : {type : String , default : 'free'/*free , cash , special */,required : true} ,
    status : {type : String , default : 'not started' ,/*notStarted,completed,opening*/} ,
    teacher : {type : mongoose.Types.ObjectId,ref : 'user', required : true} ,
    chapters : {type : [Chapter] , default : [] } ,
    students : {type : [mongoose.Types.ObjectId] , default : [] ,ref: 'user' }
},{
    toJSON : {
        virtuals : true
    }
});
courseSchema.index({title : 'text' , short_text : 'text' , text : 'text'})

courseSchema.virtual('imageURL').get(function(){
    return `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/${this.image}`
})
courseSchema.virtual('totalTime').get(function(){
    return getTimeOfCourse(this.chapters || [])
})

module.exports = {
    CourseModel : mongoose.model('course' , courseSchema)
}