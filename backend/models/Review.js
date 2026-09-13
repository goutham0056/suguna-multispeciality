import mongoose from 'mongoose';
const ReviewSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  rating:{type:Number,required:true,min:1,max:5},
  message:{type:String,required:true,trim:true,maxlength:1000},
  approved:{type:Boolean,default:false}
},{timestamps:true});
export default mongoose.model('Review', ReviewSchema);
