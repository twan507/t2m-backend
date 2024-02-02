import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RolesModule } from 'src/roles/roles.module';
import ms from 'ms';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { License, LicenseSchema } from 'src/licenses/schemas/license.schemas';
import { UsersModule } from 'src/users/users.module';
import { LicensesModule } from 'src/licenses/licenses.module';

@Module({
  imports: [PassportModule, RolesModule, UsersModule, LicensesModule,

    JwtModule.registerAsync({
      useFactory: async () => ({
        secretOrPrivateKey: process.env.JWT_ACCESS_SECRET,
        signOptions: {
          expiresIn: ms(process.env.JWT_ACCESS_EXPIRE) / 1000,
        },
      }),
    }),

    MongooseModule.forFeature([
      { name: License.name, schema: LicenseSchema },
    ])

  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule { }
