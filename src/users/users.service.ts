import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminChangePasswordDto, ChangePasswordDto, CreateUserDto, ForgetPasswordDto, RegisterUserDto, SendPasswordTokenDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { IUser } from './users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { USER_ROLE } from 'src/databases/sample';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private readonly mailService: MailService
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username })
    // .populate({ path: "role", select: { name: 1 } })
  }

  async adminChangePassword(adminChangePasswordDto: AdminChangePasswordDto, user: IUser) {
    const { email, newPassword, confirmPassword } = adminChangePasswordDto

    const isExist = await this.userModel.findOne({ email })
    if (!isExist) {
      throw new BadRequestException(`Không tìm thấy người dùng có Email: ${email}`)
    }
    if (newPassword === confirmPassword) {
      await this.userModel.updateOne(
        { email: email },
        {
          password: this.getHashPassword(newPassword),
          updatedBy: {
            _id: user._id,
            email: user.email,
          }
        })
    } else {
      throw new BadRequestException("Mật khẩu xác nhận không trùng khớp")
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: IUser) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto
    const foundUser = await this.findOneByUsername(user.email)
    if (newPassword === confirmPassword) {
      if (this.isValidPassword(currentPassword, foundUser.password)) {
        await this.userModel.updateOne(
          { email: user.email },
          {
            password: this.getHashPassword(newPassword),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          }
        )

        await this.mailService.changePasswordEmail(foundUser.name, foundUser.email)
      } else {
        throw new BadRequestException("Sai mật khẩu")
      }
    } else {
      throw new BadRequestException("Mật khẩu xác nhận không trùng khớp")
    }
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password, name, phoneNumber, affiliateCode, sponsorCode, role } = createUserDto

    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại, vui lòng sử dụng email khác`)
    }

    const roleId = await this.roleModel.findOne({ name: role })
    const hashPassword = this.getHashPassword(password)
    let newUser = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      phoneNumber,
      license: "",
      affiliateCode: affiliateCode ? affiliateCode : "",
      sponsorCode: sponsorCode ? sponsorCode : "",
      role: roleId.name,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newUser;
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, password, name, phoneNumber, affiliateCode, sponsorCode, confirmPassword } = registerUserDto

    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại, vui lòng sử dụng email khác`)
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(`Mật khẩu xác nhận không trùng khớp`)
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE })
    const hashPassword = this.getHashPassword(password)
    let newRegister = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      phoneNumber,
      license: "",
      affiliateCode: affiliateCode ? affiliateCode : "",
      sponsorCode: sponsorCode ? sponsorCode : "",
      role: userRole?.name
    })

    //Gửi email xác nhận cho khách
    await this.mailService.registerEmail(name, email)

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

  async findOne(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select("-password -tokens") // Loại bỏ password và tokens khỏi kết quả trả về
    if (!user) {
      throw new BadRequestException("Không tìm thấy User");
    }
    return user;
  }


  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    const foundUser = await this.userModel.findOne({ _id: id });
    if (!foundUser) {
      throw new BadRequestException("Không tìm thấy User")
    } else if (foundUser.email === "admin@t2m.vn") {
      throw new BadRequestException("Không thể chỉnh sửa tài khoản Admin")
    }
    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundUser = await this.userModel.findOne({ _id: id });
    if (!foundUser) {
      throw new BadRequestException("Không tìm thấy User")
    } else if (foundUser.email === "admin@t2m.vn") {
      throw new BadRequestException("Không thể xoá tài khoản Admin")
    }
    // Cập nhật thông tin người xóa
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    // Thực hiện soft delete
    return await this.userModel.softDelete({ _id: id });
  }

  updateTokensArray = async (_id: string) => {
    const devices_number = process.env.MAX_DEVICES as unknown as number
    const user = await this.userModel.findOne({ _id: _id });
    const tokensToKeep = user.tokens.slice(-devices_number); // Cắt lấy 2 phần tử cuối cùng
    await this.userModel.updateOne(
      { _id: _id },
      { $set: { tokens: tokensToKeep } }
    );
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { $push: { tokens: refreshToken } }
    )
  }

  logoutUser = async (_id: string, refreshToken: string) => {
    const user = await this.userModel.findOne({ _id: _id });
    let newTokensList = user.tokens.filter(item => item !== refreshToken);
    return await this.userModel.updateOne(
      { _id: _id },
      { $set: { tokens: newTokensList } }
    );
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email, token, newPassword, confirmPassword } = forgetPasswordDto

    const foundUser = await this.userModel.findOne({ email: email })

    if (email === foundUser.email) {
      const now = new Date()
      if (token === foundUser.getPasswordToken.token && foundUser.getPasswordToken.expiresAt > now) {
        if (newPassword === confirmPassword) {
          await this.userModel.updateOne(
            { email: email },
            {
              password: this.getHashPassword(newPassword),
              updatedBy: {
                _id: foundUser._id,
                email: foundUser.email
              }
            })
          await this.mailService.changePasswordEmail(foundUser.name, foundUser.email)
        } else {
          throw new BadRequestException("Mật khẩu xác nhận không trùng khớp")
        }
      } else if (token !== foundUser.getPasswordToken.token && foundUser.getPasswordToken.expiresAt > now) {
        throw new BadRequestException("Mã xác thực không đúng")
      } else if (token === foundUser.getPasswordToken.token && foundUser.getPasswordToken.expiresAt <= now) {
        throw new BadRequestException("Mã xác thực đã hết hạn")
      }
    } else {
      throw new BadRequestException("Email hoặc Số điện thoại không đúng")
    }
  }

  async sendPasswordToken(sendPasswordTokenDto: SendPasswordTokenDto) {
    const token = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const expiresAt = new Date(new Date().getTime() + 60000);
    const customerName = (await (this.userModel.findOne({ email: sendPasswordTokenDto.email }))).name
    if (customerName) {
      await this.userModel.updateOne(
        { email: sendPasswordTokenDto.email },
        {
          getPasswordToken: {
            token,
            expiresAt
          }
        }
      )
      await this.mailService.forgetPasswordEmail(customerName, token, sendPasswordTokenDto.email)
    } else {
      throw new BadRequestException("Không tìm thấy người dùng")
    }
  }
}
