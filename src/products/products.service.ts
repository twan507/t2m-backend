import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-Product.dto';
import { UpdateProductDto } from './dto/update-Product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/Product.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class ProductsService {

  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>
  ) { }


  async create(createProductDto: CreateProductDto, user: IUser) {

    const { name, description, monthsDuration, permissions, price } = createProductDto
    const isExist = await this.productModel.findOne({ name })

    if (isExist) {
      throw new BadRequestException(`Product có tên là ${name} đã tồn tại`)
    }

    const newProduct = await this.productModel.create({
      name, description, monthsDuration, price,
      isActive: true, 
      permissions,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newProduct?._id,
      createdAt: newProduct?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10
    const totalItems = (await this.productModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.productModel.find(filter)
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
    const Product = await this.productModel.findOne({ _id: id })
    if (!Product) {
      throw new BadRequestException("Không tìm thấy Product");
    }
    return this.productModel.findOne({ _id: id })
      // Hiển thị các thông tin ở bên module permissions, số 1 tức là hiển thị trường này
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
  }

  async findProductByName(name: string) {
    const Product = await this.productModel.findOne({ name })
    if (!Product) {
      throw new BadRequestException("Không tìm thấy Product");
    }
    return this.productModel.findOne({ name })
      // Hiển thị các thông tin ở bên module permissions, số 1 tức là hiển thị trường này
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    return await this.productModel.updateOne(
      { _id: id },
      {
        ...updateProductDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    // Kiểm tra xem người dùng có tồn tại
    const foundUser = await this.productModel.findOne({ _id: id });
    // Nếu không tìm thấy người dùng hoặc người dùng là admin
    if (!foundUser) {
      throw new BadRequestException("Không tìm thấy Product");
    } else if (foundUser.name in ["ADMIN", "USER"]) {
      throw new BadRequestException("Không thể xoá Product ADMIN và USER")
    }
    // Cập nhật thông tin người xóa
    await this.productModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    // Thực hiện soft delete
    return await this.productModel.softDelete({ _id: id });
  }
}
