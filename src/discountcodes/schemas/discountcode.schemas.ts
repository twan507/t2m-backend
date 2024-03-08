import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DiscountcodeDocument = HydratedDocument<Discountcode>;

@Schema({ timestamps: true })
export class Discountcode {

    @Prop()
    userEmail: string

    @Prop()
    code: string

    @Prop()
    maxDiscount: number

    @Prop()
    type: string

    @Prop()
    isActive: boolean

    @Prop({ type: Object })
    createdBy: {
        _id: Types.ObjectId
        email: string
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: Types.ObjectId
        email: string
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: Types.ObjectId
        email: string
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;

}

export const DiscountcodeSchema = SchemaFactory.createForClass(Discountcode);