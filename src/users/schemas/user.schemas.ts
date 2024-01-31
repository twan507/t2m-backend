import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    
    @Prop()
    email: string;
    
    @Prop()
    password: string;

    @Prop()
    name: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    affiliateCode: string;

    @Prop()
    sponsorCode: string;

    // @Prop({ type: Types.ObjectId, ref: License.name})
    // licenses: Types.ObjectId;

    // @Prop({ type: Types.ObjectId, ref: Role.name})
    // role: Types.ObjectId;

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

    @Prop()
    tokens: string[]
}

export const UserSchema = SchemaFactory.createForClass(User);