import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, CTV_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schemas';
import { User, UserDocument } from 'src/users/schemas/user.schemas';
import { Product, ProductDocument } from 'src/products/schemas/Product.schemas';
import { Discountcode, DiscountcodeDocument } from 'src/discountcodes/schemas/discountcode.schemas';

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

        @InjectModel(Discountcode.name)
        private discountcodeModel: SoftDeleteModel<DiscountcodeDocument>,

        private userService: UsersService
    ) { }


    async onModuleInit() {
        const isInit = process.env.SHOULD_INIT;
        if (Boolean(isInit)) {

            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});
            const countProduct = await this.productModel.count({});
            const countCode = await this.discountcodeModel.count({});

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
                        permissions: permissions,
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65bc76898f73921d2363a9eb",
                        name: USER_ROLE,
                        isActive: true,
                        permissions: [], //không set quyền, chỉ cần add ROLE
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65bcd948b8ef62c47fc3cad6",
                        name: CTV_ROLE,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                ]);
            }

            // create users
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE })
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                const ctvRole = await this.roleModel.findOne({ name: CTV_ROLE })
                await this.userModel.insertMany([
                    {
                        _id: "65bc76897e9d32d76d997a48",
                        email: "admin@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M ADMIN",
                        affiliateCode: "",
                        sponsorCode: "",
                        phoneNumber: "0123456789",
                        role: adminRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "650730de8f1fdf605bd5dc88",
                        email: "tradertruongdao@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "tradertruongdao",
                        affiliateCode: "VIP001",
                        sponsorCode: "",
                        phoneNumber: "0888213688",
                        role: adminRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "658d5435b0ee9d55433e05cb",
                        email: "maigt@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "Mai Mai",
                        affiliateCode: "VIP002",
                        sponsorCode: "",
                        phoneNumber: "0973321345",
                        role: adminRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65d794cee8f8d2ffa24d7c53",
                        email: "tuanba@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "Bùi Anh Tuấn",
                        affiliateCode: "VIP003",
                        sponsorCode: "",
                        phoneNumber: "0912005777",
                        role: adminRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65bc7689a59dc544823ae394",
                        email: "ctv@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M CTV",
                        phoneNumber: "0123456789",
                        affiliateCode: "CTV000",
                        sponsorCode: "",
                        role: ctvRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65ac92615d129792b1c31257",
                        email: "user1@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M USER 1",
                        phoneNumber: "0123456789",
                        affiliateCode: "",
                        sponsorCode: "CTV000",
                        role: userRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65902cfde8ed8a68ef4f8cc4",
                        email: "user2@t2m.vn",
                        password: this.userService.getHashPassword(process.env.INIT_PASSWORD),
                        name: "T2M USER 2",
                        phoneNumber: "0123456789",
                        affiliateCode: "",
                        sponsorCode: "CTV000",
                        role: userRole?.name,
                        license: "",
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                ])
            }

            // create products
            if (countProduct === 0) {
                const permissions = await this.productModel.find({}).select("_id");
                await this.productModel.insertMany([
                    {
                        _id: "65b8f0ff5c3c9a2d111a5ceb",
                        name: 'TRIAL',
                        monthsDuration: 0,
                        accessLevel: 4,
                        price: 0,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "659fdb605bb15cebbeb9f3ee",
                        name: 'BASIC',
                        monthsDuration: 1,
                        accessLevel: 1,
                        price: 2000000,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "6531541fed0d0ec2fcccd3ec",
                        name: 'ADVANCED',
                        monthsDuration: 3,
                        accessLevel: 2,
                        price: 4000000,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65759a4c34b40159373557df",
                        name: 'PRO',
                        monthsDuration: 6,
                        accessLevel: 3,
                        price: 6000000,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "65df43714b4f634586f36407",
                        name: 'PREMIUM',
                        monthsDuration: 12,
                        accessLevel: 4,
                        price: 10000000,
                        isActive: true,
                        permissions: [],
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                ]);
            }

            if (countCode === 0) {
                await this.discountcodeModel.insertMany([
                    {
                        _id: "65ab8fabd66c3811fa2c04d1",
                        userEmail: 'tradertruongdao@t2m.vn',
                        code: 'VIP001',
                        discountPercent: [5, 10, 15, 20, 25],
                        type: 'Admin',
                        isActive: true,
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "656ca0a8f38f38fdee1139ec",
                        userEmail: 'maigt@t2m.vn',
                        code: 'VIP002',
                        discountPercent: [5, 10, 15, 20, 25],
                        type: 'Admin',
                        isActive: true,
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "655efedb9aec0d54ae553dec",
                        userEmail: 'tuanba@t2m.vn',
                        code: 'VIP003',
                        discountPercent: [5, 10, 15, 20, 25],
                        type: 'Admin',
                        isActive: true,
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                    {
                        _id: "659cfafcf65d2c86dd680ca0",
                        userEmail: 'ctv@t2m.vn',
                        code: 'CTV000',
                        discountPercent: [5, 10, 15, 20, 25],
                        type: 'Affiliate',
                        isActive: true,
                        createdBy: {
                            "_id": "65bc76897e9d32d76d997a48",
                            "email": "admin@t2m.vn"
                        }
                    },
                ]);
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }
        }
    }
}
