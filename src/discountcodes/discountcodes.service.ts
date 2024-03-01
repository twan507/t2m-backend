import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountcodeDto } from './dto/create-discountcode.dto';
import { UpdateDiscountcodeDto } from './dto/update-discountcode.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Discountcode, DiscountcodeDocument } from './schemas/discountcode.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class DiscountcodesService {

  constructor(
    @InjectModel(Discountcode.name)
    private discountcodeModel: SoftDeleteModel<DiscountcodeDocument>,
  ) { }

  async create(createDiscountcodeDto: CreateDiscountcodeDto, user: IUser, type: string) {

    const { code, discountPercent } = createDiscountcodeDto
    const isExist = await this.discountcodeModel.findOne({ code })

    if (isExist) {
      throw new BadRequestException(`Mã ${code} đã tồn tại`)
    }

    const newDiscountCode = await this.discountcodeModel.create({
      code, discountPercent, isActive: true, type,
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

  async addCode(code: string, discountPercent: number[], type: string, user: IUser, userEmail: string) {

    const foundCode = await this.discountcodeModel.findOne({ code })
    if (foundCode) {
      if (!foundCode.userEmail) {
        throw new BadRequestException(`Mã ${code} đã tồn tại`)
      } else {
        await this.discountcodeModel.updateOne(
          { userEmail: foundCode.userEmail },
          { isActive: true }
        )
        return 'ok'
      }
    }

    const foundUser = await this.discountcodeModel.findOne({ userEmail })
    if (foundUser) {
      throw new BadRequestException(`Tài khoản ${userEmail} đã tồn tại mã CTV, hãy kích hoạt lại với mã ${foundUser.code}`)
    }

    await this.discountcodeModel.create({
      userEmail, code, discountPercent, isActive: true, type,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return 'ok'
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

  async findDiscountCode(code: string, userEmail: string) {
    const foundCode = await this.discountcodeModel.findOne({ code })
    if (foundCode) {
      return foundCode._id
    } else {
      const foundUser = await this.discountcodeModel.findOne({ userEmail })
      throw new BadRequestException(`Sử dụng mã ${foundUser.code} để huỷ tư cách CTV của ${userEmail}`);
    }
  }

  async findAllSponsorCode() {
    const codeList = await this.discountcodeModel.find({ type: { $ne: 'Discount' } })
    return codeList.map(item => item.code)
  }

  async changeActivation(id: string, user: IUser, status: boolean) {
    return await this.discountcodeModel.updateOne(
      { _id: id },

      // Cập nhật trạng thái vô hiệu hoá
      {
        isActive: status,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
    );
  }

  async remove(id: string, user: IUser) {
    const foundCode = await this.discountcodeModel.findOne({ _id: id });
    if (!foundCode) {
      throw new BadRequestException("Không tìm thấy User")
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
