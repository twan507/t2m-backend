import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { LicensesService } from 'src/licenses/licenses.service';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { License, LicenseDocument } from 'src/licenses/schemas/license.schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(

    @InjectModel(License.name)
    private licenseModel: SoftDeleteModel<LicenseDocument>,

    private rolesService: RolesService,
    private licensesService: LicensesService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role, license } = payload;

    const userRole = role as unknown as { _id: string, name: string }
    const tempRole = userRole ? await this.rolesService.findOne(userRole._id) : { permissions: [] }

    const userLicense = license as any
    const tempLicense = userLicense ? await this.licensesService.findOne(userLicense) : { permissions: [] }

    const licensePermissions = tempLicense.permissions
    const rolePermissions = tempRole.permissions
    const userPermissions = [...new Set([...licensePermissions, ...rolePermissions])]

    return {
      _id,
      name,
      email,
      role,
      permissions: userPermissions
    };
  }
}