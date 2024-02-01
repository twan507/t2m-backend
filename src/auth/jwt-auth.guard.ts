import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()

        //Khai báo thêm biến từ decorator để kiểm tra xem có bỏ qua việc check permission không
        const isSkipPermision = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PERMISSION, [
            context.getHandler(),
            context.getClass()
        ])


        if (err || !user) {
            throw err || new UnauthorizedException("Token không hợp lệ hoặc không có Baerer token ở Header request");
        }

        //check permission
        const targetMethod = request.method
        const targetEndpoint = request.route?.path as string

        const permissions = user?.permissions ?? []
        let isExist = permissions.find(permission =>
            targetMethod === permission.method
            &&
            targetEndpoint === permission.apiPath
        )

        if (targetEndpoint.startsWith("/api/v1/auth")) isExist = true

        //Nếu không tồn tại permission và cũng không bỏ qua việc check permission
        if (!isExist && !isSkipPermision) {
            throw new ForbiddenException("Bạn không có quyền truy cập Endpoint này")
        }

        return user;
    }
}