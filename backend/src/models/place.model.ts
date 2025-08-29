import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBusyTimes {
    day: number;
    hours: number[];
}

export interface IPlace extends Document {
    placeId: string;
    name: string;
    type: string;
    address: string;
    rating: number;
    reviews: number;
    priceLevel?: number;
    location: { lat: number; lng: number };
    busyTimes: IBusyTimes[];
    updatedAt: Date;
    createdAt: Date;
}

const PlaceSchema = new Schema<IPlace>(
    {
        placeId: { type: String, required: true, unique: true },
        name: { type: String, required: true, index: true },
        type: { type: String, required: true },
        address: { type: String, required: true },
        rating: { type: Number, required: true },
        reviews: { type: Number, required: true },
        priceLevel: { type: Number },
        location: {
            lat: { type: Number },
            lng: { type: Number},
        },
        busyTimes: [
            {
                day: { type: Number },
                hours: [{ type: Number}],
            },
        ],
    },
    { timestamps: true }
);

PlaceSchema.index({
    name: 'text',
    address: 'text'
});

PlaceSchema.index({ name: 1 });
PlaceSchema.index({ address: 1 });
PlaceSchema.index({ rating: -1 });
PlaceSchema.index({ reviews: -1 });
PlaceSchema.index({ priceLevel: 1 });


const Place: Model<IPlace> = mongoose.model<IPlace>('Place', PlaceSchema);

export default Place;