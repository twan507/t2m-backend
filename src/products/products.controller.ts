import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productsService.create(createProductDto, user);
  }

  @Post('find-by-product')
  findProductByName(@Body() body: { name: string }) {
    return this.productsService.findProductByName(body.name);
  }

  @Get()
  @ResponseMessage("Fetch list Product with paginate")
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.productsService.findAll(+current, +pageSize, qs);
  }

  @SkipCheckPermission()
  @Get('active-list')
  @ResponseMessage("Get list active product")
  findActiveProducts() {
    return this.productsService.findActiveProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User() user: IUser) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Patch(':id')
  changeActivation(@Param('id') id: string, @User() user: IUser, @Body() body: { status: boolean }) {
    return this.productsService.changeActivation(id, user, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productsService.remove(id, user);
  }
}
