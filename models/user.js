import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
    },

    password:{
        type:String,
        required:true,
    }, 
    
    verified:{
        type:Boolean,
        default:false
    },

    role:{
        type:String,
        default:'user'
    }
},
{timestamps:true},);

const user = mongoose.model('user',userSchema);

export default user;