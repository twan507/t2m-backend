import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private rolesService: RolesService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;

    const userRole = role as unknown as { _id: string, name: string }
    const temp = await this.rolesService.findOne(userRole._id)

    return {
      _id,
      name,
      email,
      role,
      permissions: temp?.permissions ?? []
    };
  }
}