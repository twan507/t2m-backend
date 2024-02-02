import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLicenseDto } from './dto/create-License.dto';
import { UpdateLicenseDto } from './dto/update-License.dto';
import { InjectModel } from '@nestjs/mongoose';
import { License, LicenseDocument } from './schemas/license.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { ProductsService } from 'src/products/products.service';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { UsersService } from 'src/users/users.service';
import { User, UserDocument } from 'src/users/schemas/user.schemas';

@Injectable()
export class LicensesService {

  constructor(
    @InjectModel(License.name)
    private licenseModel: SoftDeleteModel<LicenseDocument>,

    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    private productsService: ProductsService,
    private usersService: UsersService,
  ) { }


  async updateLincesesDaysLeft() {
    const allLincenses = await this.licenseModel.find()
    for (const lincense of allLincenses) {
      const daysLeft = (lincense.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      if (daysLeft > 0) {
        await this.licenseModel.updateOne(
          { _id: lincense._id },
          { daysLeft }
        )
      } else {
        await this.licenseModel.updateOne(
          { _id: lincense._id },
          { isActive: false }
        )
        await this.userModel.updateOne(
          { email: lincense.userEmail },
          { license: "" }
        )
      }
    }
  }

  async create(createLicenseDto: CreateLicenseDto, user: IUser) {

    const { userEmail, product } = createLicenseDto
    const foundProduct = await this.productsService.findProductByName(product)
    const foundUser = await this.usersService.findOneByUsername(userEmail)
    if (foundUser) {
      if (foundUser.license) {
        throw new BadRequestException(`User ${userEmail} đang có một license đã được kích hoạt`)
      }
    } else {
      throw new BadRequestException(`Không tìm thấy người dùng ${userEmail}`)
    }
    // Tính toán lưu lại các ngày hiệu lực
    const startDate = new Date();
    const endDate = new Date(new Date().setMonth(new Date().getMonth() + foundProduct.monthsDuration))
    const daysLeft = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)

    const newLicense = await this.licenseModel.create({
      startDate,
      endDate,
      daysLeft,
      userEmail,
      product: foundProduct.name,
      permissions: foundProduct.permissions,
      isActive: true,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    //Thêm license id vào cho user
    await this.userModel.updateOne(
      { email: foundUser.email },
      { license: newLicense?._id }
    )

    return {
      _id: newLicense?._id,
      createdAt: newLicense?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.licenseModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.licenseModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec()

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    const license = await this.licenseModel.findOne({ _id: id })
    if (!license) {
      throw new BadRequestException("Không tìm thấy License");
    }
    return this.licenseModel.findOne({ _id: id })
      // Hiển thị các thông tin ở bên module permissions, số 1 tức là hiển thị trường này
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
  }

  async update(id: string, updateLicenseDto: UpdateLicenseDto, user: IUser) {
    return await this.licenseModel.updateOne(
      { _id: id },
      {
        ...updateLicenseDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundLicense = await this.licenseModel.findOne({ _id: id });
    if (!foundLicense) {
      throw new BadRequestException("Không tìm thấy License")
    }
    // Cập nhật thông tin người xóa
    await this.licenseModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    // Xoá license ở User
    await this.userModel.updateOne(
      { email: foundLicense.userEmail },
      { license: "" }
    )
    // Thực hiện soft delete
    return await this.licenseModel.softDelete({ _id: id });
  }
}
