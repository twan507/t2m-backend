import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schemas';
import { User, UserDocument } from 'src/users/schemas/user.schemas';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);

    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,

        private userService: UsersService
    ) { }


    async onModuleInit() {
        const isInit = process.env.SHOULD_INIT;
        if (Boolean(isInit)) {

            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});

            //create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
                //bulk create
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select("_id");
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        name: USER_ROLE,
                        isActive: true,
                        permissions: [] //không set quyền, chỉ cần add ROLE
                    }
                ]);
            }

            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                await this.userModel.insertMany([
                    {
                        email: "admin@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M ADMIN",
                        phoneNumber: "0123456789",
                        role: adminRole?._id
                    },
                    {
                        email: "user@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M USER",
                        phoneNumber: "0123456789",
                        role: userRole?._id
                    },
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }
        }
    }
}
