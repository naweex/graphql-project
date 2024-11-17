const { Kind } = require("graphql");
function parseObject(valueNode){
    const value = Object.create(null);
    valueNode.fields.forEach(field => {
        value[field.name.value] = parseValueNode(field.value)
    })
    return value
}
function parseValueNode(valueNode){
    switch(valueNode.Kind){
        case Kind.STRING:
        case Kind.BOOLEAN:
            return valueNode.value
        case Kind.INT:
        case Kind.FLOAT:
            return Number(valueNode.value)
        case Kind.OBJECT:
            return parseObject(valueNode.value)
        case Kind.LIST:
            return valueNode.value.map(parseValueNode)
        default:
            return null;
    }
}
function parseLiteral(valueNode){
    switch(valueNode.kind){
        case Kind.STRING:
            return valueNode.value.charAt(0) === '{'? JSON.parse(valueNode.value) : valueNode.value
        case Kind.INT:
        case Kind.FLOAT:
            return Number(valueNode.value)
        case Kind.OBJECT:
    }
} 
function toObject(value){
    if(typeof value === 'object'){
        return value    
        }
    if(typeof value === 'string' && value.charAt(0) === '{'){
        return JSON.parse(value)
        }
        return null
}
function copyObject(object){
    return JSON.parse(JSON.stringify(object))
}
async function checkExistCourse(id){
    const course =  await CourseModel.findById(id);
    if(!course) throw createHttpError.NotFound("دوره ای با این مشخصات یافت نشد")
    return course
}
async function checkExistProduct(id){
    const product =  await ProductModel.findById(id);
    if(!product) throw createHttpError.NotFound("محصولی با این مشخصات یافت نشد")
    return product
}
async function checkExistBlog(id){
    const blog =  await BlogModel.findById(id);
    if(!blog) throw createHttpError.NotFound("بلاگی با این مشخصات یافت نشد")
    return blog
}
function getTime(time) {
    let total = Math.round(time) / 60;
    let [min, percentage] = String(total).split(".");
    if(percentage == undefined) percentage = "0"
    let sec = Math.round(((percentage.substring(0,2)) * 60) / 100);
    let hour = 0;
    if (min > 59) {
      total = min / 60;
      [hour , percentage] = String(total).split(".")
      if(percentage == undefined) percentage = "0"
      min = Math.round(((percentage.substring(0,2)) * 60) / 100);
    }
    if(hour < 10 ) hour = `0${hour}` ;
    if(min < 10) min = `0${min}`
    if(sec < 10) sec = `0${sec}`
    return hour + ":" + min + ":" + sec;
  }
  function getTimeOfCourse(chapters = []) {
    let time,hour,minute,second = 0;
    for (const chapter of chapters) {
        if(Array.isArray(chapter?.episodes)){
        for (const episode of chapter.episode) {
            if(episode?.time) time = episode.time.split(':')
                else time = '00:00:00'.split(':')
            if(time.length == 3){
                second += Number(time[0]) * 3600 //convert hour to second
                second += Number(time[1]) * 60 // convert minute to second
                second += Number(time[2]) //sum second with second
            }else if(time.length == 2){
                    second += Number(time[0]) * 60 // convert minute to second
                    second += Number(time[1]) //sum second with second
                }
            }
        }
    }
    hour = Math.floor(second / 3600) //convert second to hour
    minute = Math.floor(second / 60) % 60 //convert second to minute
    second = Math.floor(second % 60) //convert seconds to second
    if(hour < 10 ) hour = `0${hour}` ;
    if(min < 10) min = `0${min}`
    if(sec < 10) sec = `0${sec}`
    return hour + ":" + min + ":" + sec;
  }

module.exports = {
    parseObject ,
    parseValueNode ,
    parseLiteral ,
    toObject ,
    copyObject ,
    checkExistCourse ,
    checkExistProduct ,
    checkExistBlog ,
    getTime ,
    getTimeOfCourse
}