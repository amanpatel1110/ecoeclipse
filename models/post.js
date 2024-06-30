import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true,
    }
},
{timestamps:true}
);

const post = new mongoose.model('post',postSchema);

export default post;