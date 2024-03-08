import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountcodeDto } from './dto/create-discountcode.dto';
import { UpdateDiscountcodeDto } from './dto/update-discountcode.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Discountcode, DiscountcodeDocument } from './schemas/discountcode.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { License, LicenseDocument } from 'src/licenses/schemas/license.schemas';

@Injectable()
export class DiscountcodesService {

  constructor(
    @InjectModel(Discountcode.name)
    private discountcodeModel: SoftDeleteModel<DiscountcodeDocument>,

    @InjectModel(License.name)
    private licenseModel: SoftDeleteModel<LicenseDocument>,
  ) { }

  async create(createDiscountcodeDto: CreateDiscountcodeDto, user: IUser) {

    const { code, maxDiscount } = createDiscountcodeDto
    const isExist = await this.discountcodeModel.findOne({ code })

    if (isExist) {
      throw new BadRequestException(`Mã ${code} đã tồn tại`)
    }

    const newDiscountCode = await this.discountcodeModel.create({
      code, maxDiscount, isActive: true, type: 'DISCOUNT',
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newDiscountCode?._id,
      createdAt: newDiscountCode?.createdAt
    }
  }

  async addCode(code: string, maxDiscount: number, type: string, user: IUser, userEmail: string) {

    const foundUser = await this.discountcodeModel.findOne({ userEmail })
    if (foundUser) {
      if (code !== foundUser.code) {
        throw new BadRequestException(`Tài khoản ${userEmail} đã tồn tại mã CTV, hãy kích hoạt lại với mã ${foundUser.code}`)
      }
    }

    const foundCode = await this.discountcodeModel.findOne({ code })
    if (foundCode) {
      if (!foundCode.isActive) {
        await this.discountcodeModel.updateOne(
          { userEmail: foundCode.userEmail },
          { isActive: true }
        )
      } else {
        throw new BadRequestException(`Mã ${code} đã tồn tại`)
      }
    }

    await this.discountcodeModel.create({
      userEmail, code, maxDiscount, isActive: true, type: 'CTV',
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findDiscountCode(code: string, userEmail: string) {
    const foundCode = await this.discountcodeModel.findOne({ code, isActive: true })
    const foundUser = await this.discountcodeModel.findOne({ userEmail, isActive: true })

    //@ts-ignore
    if (foundCode.code === foundUser.code) {
      return foundCode._id
    } else {
      throw new BadRequestException(`Sử dụng mã ${foundUser.code} để huỷ tư cách CTV của ${userEmail}`);
    }
  }

  async changeActivation(id: string, user: IUser, status: boolean) {

    const foundCode = await this.discountcodeModel.findOne({ _id: id })
    const foundLicense = await this.licenseModel.findOne({ discountCode: foundCode.code })

    if (foundLicense && status === false) {
      throw new BadRequestException(`Không thể vô hiệu hoá mã ${foundCode.code} do vẫn còn License đang sử dụng`)
    }

    return await this.discountcodeModel.updateOne(
      { _id: id },

      // Cập nhật trạng thái vô hiệu hoá
      {
        isActive: status,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.discountcodeModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.discountcodeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select("-password")
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
    const code = await this.discountcodeModel.findOne({ _id: id })
    if (!code) {
      throw new BadRequestException("Không tìm thấy mã giảm giá");
    }
    return code;
  }

  async findByCode(code: string) {
    const foundCode = await this.discountcodeModel.findOne({ code })
    if (!foundCode) {
      throw new BadRequestException("Không tìm thấy mã giảm giá");
    }
    return foundCode;
  }

  async findAllSponsorCode() {
    const codeList = await this.discountcodeModel.find({ type: { $ne: 'DISCOUNT' }, isActive: true })
    return codeList.map(item => item.code)
  }

  async update(id: string, updateDiscountcodeDto: UpdateDiscountcodeDto, user: IUser) {

    // const foundCode = await this.discountcodeModel.findOne({ _id: id })
    // if (foundCode?.isActive === true) {
    //   throw new BadRequestException("Không thể chỉnh sửa mã đang ở trạng thái kích hoạt");
    // }

    return await this.discountcodeModel.updateOne(
      { _id: id },
      {
        ...updateDiscountcodeDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundCode = await this.discountcodeModel.findOne({ _id: id });
    if (foundCode.isActive) {
      throw new BadRequestException("Không thể xoá mã đang được kích hoạt");
    }
    // Cập nhật thông tin người xóa
    await this.discountcodeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    // Thực hiện soft delete
    return await this.discountcodeModel.softDelete({ _id: id });
  }
}
