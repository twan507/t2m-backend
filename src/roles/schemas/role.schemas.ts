import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from 'src/permissions/schemas/permission.schemas';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {

    @Prop()
    name: string;

    @Prop()
    isActive: boolean;

    @Prop({ type: [Types.ObjectId], ref: Permission.name })
    permissions: Permission[];

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

export const RoleSchema = SchemaFactory.createForClass(Role);
