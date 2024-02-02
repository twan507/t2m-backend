import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from 'src/permissions/schemas/permission.schemas';
import { Product } from 'src/products/schemas/Product.schemas';

export type LicenseDocument = HydratedDocument<License>;

@Schema({ timestamps: true })
export class License {

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    daysLeft: number;

    @Prop()
    userEmail: string;

    @Prop()
    imageProof: string;

    @Prop({ type: Object, ref: Product.name })
    product: Product

    @Prop({ type: [Types.ObjectId], ref: Permission.name })
    permissions: Permission[];

    @Prop()
    isActive: string;

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

export const LicenseSchema = SchemaFactory.createForClass(License);
