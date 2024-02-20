import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { License } from 'src/licenses/schemas/license.schemas';
import { Role } from 'src/roles/schemas/role.schemas';

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

    @Prop()
    license: Types.ObjectId;

    @Prop()
    role: string;

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

    @Prop({ type: Object })
    getPasswordToken: {
        token: string
        expiresAt: Date
    }
}

export const UserSchema = SchemaFactory.createForClass(User);