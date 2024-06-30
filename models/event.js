import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    date:{
        type:String,
        required:true,
    },

    day:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },
},
{timestamps:true}
);

const event = new mongoose.model('event',eventSchema);

export default event;