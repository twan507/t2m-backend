import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class RolesService {

  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }


  async create(createRoleDto: CreateRoleDto, user: IUser) {

    const { name, permissions } = createRoleDto
    const isExist = await this.roleModel.findOne({ name })

    if (isExist) {
      throw new BadRequestException(`Role có tên là ${name} đã tồn tại`)
    }

    const newRole = await this.roleModel.create({
      name, isActive: true, permissions,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.roleModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.roleModel.find(filter)
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
    const role = await this.roleModel.findOne({ _id: id })
    if (!role) {
      throw new BadRequestException("Không tìm thấy Role");
    }
    return this.roleModel.findOne({ _id: id })
      // Hiển thị các thông tin ở bên module permissions, số 1 tức là hiển thị trường này
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
  }

  async findRoleByName(name: string) {
    const role = await this.roleModel.findOne({ name: name })
    if (!role) {
      throw new BadRequestException("Không tìm thấy Role");
    }
    return this.roleModel.findOne({ name: name })
      // Hiển thị các thông tin ở bên module permissions, số 1 tức là hiển thị trường này
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    const foundUser = await this.roleModel.findOne({ _id: id });
    if (!foundUser) {
      throw new BadRequestException("Không tìm thấy Role");
    } else if (foundUser.name === "T2M ADMIN") {
      throw new BadRequestException("Không thể chỉnh sửa role T2M ADMIN")
    }
    return await this.roleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundUser = await this.roleModel.findOne({ _id: id });
    if (!foundUser) {
      throw new BadRequestException("Không tìm thấy Role");
    } else if (foundUser.name in ["ADMIN", "USER"]) {
      throw new BadRequestException("Không thể xoá role ADMIN và USER")
    }
    // Cập nhật thông tin người xóa
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    // Thực hiện soft delete
    return await this.roleModel.softDelete({ _id: id });
  }
}
