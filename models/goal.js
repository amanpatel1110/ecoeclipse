import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    
    task:{
        type:String,
        required:true,
    },

    completed:{
        type:Boolean,
        required:true,
    }
},
{timestamps:true},
);

const goal = mongoose.model('goal',goalSchema);

export default goal;