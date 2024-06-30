import mongoose from 'mongoose';

const footprintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    noOfGas: {
        type: Number,
        required: true,
    },

    kwh: {
        type: Number,
        required: true,
    },

    vehicles: [
        {
            type: {
                type: String,
                enum: ['petrol', 'diesel', 'cng', 'electric'],
                required: true
            },
            mileage: {
                type: Number,
                required: true
            },
            kms: {
                type: Number,
                required: true
            }
        }
    ],

    srtFlights: {
        type: Number,
        required: true,
    },

    medFlights: {
        type: Number,
        required: true,
    },

    longFlights: {
        type: Number,
        required: true,
    },

    train: {
        type: Number,
        required: true,
    },

    noOfBags: {
        type: Number,
        required: true,
    },
},
    { timestamps: true }
);

const footprint = mongoose.model('footprint', footprintSchema);

export default footprint;