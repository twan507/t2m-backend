import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schemas';
import { User, UserDocument } from 'src/users/schemas/user.schemas';
import { Product, ProductDocument } from 'src/products/schemas/Product.schemas';

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

        @InjectModel(Product.name)
        private productModel: SoftDeleteModel<ProductDocument>,

        private userService: UsersService
    ) { }


    async onModuleInit() {
        const isInit = process.env.SHOULD_INIT;
        if (Boolean(isInit)) {

            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});
            const countProduct = await this.productModel.count({});

            //create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select("_id");
                await this.roleModel.insertMany([
                    {
                        _id: "65bc7689a2be17285bf42c81",
                        name: ADMIN_ROLE,
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        _id: "65bc76898f73921d2363a9eb",
                        name: USER_ROLE,
                        isActive: true,
                        permissions: [] //không set quyền, chỉ cần add ROLE
                    },
                ]);
            }

            // create role
            if (countProduct === 0) {
                const permissions = await this.productModel.find({}).select("_id");
                await this.productModel.insertMany([
                    {
                        _id: "6562ab56db6ccf2b1baf343b",
                        name: 'FREE',
                        monthsDuration: 999,
                        isActive: true,
                        permissions: []
                    },
                    {
                        _id: "6531541fed0d0ec2fcccd3ec",
                        name: 'BASIC',
                        monthsDuration: 12,
                        isActive: true,
                        permissions: []
                    },
                    {
                        _id: "65759a4c34b40159373557df",
                        name: 'PRO',
                        monthsDuration: 12,
                        isActive: true,
                        permissions: [] 
                    },
                    {
                        _id: "65df43714b4f634586f36407",
                        name: 'PREMIUM',
                        monthsDuration: 12,
                        isActive: true,
                        permissions: [] 
                    },
                ]);
            }

            // create users
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                await this.userModel.insertMany([
                    {
                        _id: "65bc76897e9d32d76d997a48",
                        email: "tradertruongdao@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "tradertruongdao",
                        affiliateCode: "VIP001",
                        phoneNumber: "0888213688",
                        role: adminRole?.name,
                        license: ""
                    },
                    {
                        _id: "658d5435b0ee9d55433e05cb",
                        email: "maigt@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "Mai Mai",
                        affiliateCode: "VIP002",
                        phoneNumber: "0973321345",
                        role: adminRole?.name,
                        license: ""
                    },
                    {
                        _id: "65d794cee8f8d2ffa24d7c53",
                        email: "tuanba@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "Bùi Anh Tuấn",
                        affiliateCode: "VIP003",
                        phoneNumber: "0912005777",
                        role: adminRole?.name,
                        license: ""
                    },
                    {
                        _id: "65bc7689a59dc544823ae394",
                        email: "user01@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M USER 01",
                        phoneNumber: "0123456789",
                        role: userRole?.name,
                        license: ""
                    },
                    {
                        _id: "65ac92615d129792b1c31257",
                        email: "user02@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M USER 02",
                        phoneNumber: "0123456789",
                        role: userRole?.name,
                        license: ""
                    },
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }
        }
    }
}
