import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { IUser } from './users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password, name, phoneNumber, affiliateCode, sponsorCode, role } = createUserDto
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại, vui lòng sử dụng email khác`)
    }
    const hashPassword = this.getHashPassword(password)
    let newUser = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      phoneNumber,
      affiliateCode: affiliateCode ? affiliateCode : "",
      sponsorCode: sponsorCode ? sponsorCode : "",
      role,
      // createdBy: {
      //   _id: user._id,
      //   email: user.email
      // }
    })
    return newUser;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, name, phoneNumber, affiliateCode, sponsorCode, role } = createUserDto
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại, vui lòng sử dụng email khác`)
    }
    // const userRole = await this.roleModel.findOne({ name: USER_ROLE })
    const hashPassword = this.getHashPassword(password)
    let newRegister = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      phoneNumber,
      affiliateCode: affiliateCode ? affiliateCode : "",
      sponsorCode: sponsorCode ? sponsorCode : "",
      // role: userRole?._id
    })
    return newRegister
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.userModel.find(filter)
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

  // const foundRole = await this.roleModel.findById(id)

  async findOne(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select("-password -tokens") // Loại bỏ password và tokens khỏi kết quả trả về
    // .populate({ path: "role", select: { name: 1, _id: 1 } });
    if (!user) {
      throw new BadRequestException("Không tìm thấy User");
    }
    return user;
  }


  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        // updatedBy: {
        //   _id: user._id,
        //   email: user.email
        // }
      }
    );
  }

  async remove(id: string, user: IUser) {
    // Kiểm tra xem người dùng có tồn tại và không phải là admin
    const foundUser = await this.userModel.findOne({
      _id: id,
      email: { $ne: "admin@gmail.com" } // $ne là toán tử "not equal" trong MongoDB
    });
    // Nếu không tìm thấy người dùng hoặc người dùng là admin
    if (!foundUser) {
      throw new BadRequestException(
        foundUser ? "Không thể xoá tài khoản Admin" : "Không tìm thấy User"
      );
    }
    // Cập nhật thông tin người xóa
    // await this.userModel.updateOne(
    //   { _id: id },
    //   {
    //     deletedBy: {
    //       _id: user._id,
    //       email: user.email,
    //     },
    //   }
    // );
    // Thực hiện soft delete
    return await this.userModel.softDelete({ _id: id });
  }
}
