import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { License, LicenseDocument } from 'src/licenses/schemas/license.schemas';

@Injectable()
export class ProductsService {

  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,

    @InjectModel(License.name)
    private licenseModel: SoftDeleteModel<LicenseDocument>,
  ) { }

  async changeActivation(id: string, user: IUser, status: boolean) {

    const foundProduct = await this.productModel.findOne({ _id: id })
    const foundLicense = await this.licenseModel.findOne({ product: foundProduct.name })

    if (foundLicense && status === false) {
      throw new BadRequestException(`Không thể vô hiệu hoá sản phẩm ${foundProduct.name} do vẫn còn License đang sử dụng`)
    }

    return await this.productModel.updateOne(
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

  async findActiveProducts() {
    const productList = await this.productModel.find({ isActive: true })
    return productList.map(item => item.name)
  }

  async create(createProductDto: CreateProductDto, user: IUser) {

    const { name, monthsDuration, permissions, price, accessLevel } = createProductDto
    const isExist = await this.productModel.findOne({ name })

    if (isExist) {
      throw new BadRequestException(`Product có tên là ${name} đã tồn tại`)
    }

    const newProduct = await this.productModel.create({
      name, monthsDuration, price, accessLevel,
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
    const foundProduct = await this.productModel.findOne({ _id: id });
    if (foundProduct.isActive) {
      throw new BadRequestException("Không thể xoá sản phẩm đang được kích hoạt");
    }
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
