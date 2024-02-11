//Decorator sử dụng để mở khoá các route mà muốn public
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//Decorator sử dụng để truyền nhanh biến User từ controller sang service
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

//Decorator custom message của API
export const RESPONSE_MESSAGE = 'response_message'
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message)

//Decorator bỏ qua việc check permission
export const IS_PUBLIC_PERMISSION = 'isPublicPermission';
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_PERMISSION, true);


