import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:80},
  phone:{type:String,required:true,trim:true,maxlength:20},
  email:{type:String,default:'',trim:true,maxlength:120},
  subject:{type:String,default:'General Enquiry',trim:true,maxlength:120},
  message:{type:String,required:true,trim:true,maxlength:1500},
  status:{type:String,enum:['new','read','resolved'],default:'new'}
},{timestamps:true});

export default mongoose.model('Enquiry',enquirySchema);
