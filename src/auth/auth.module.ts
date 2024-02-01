import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { RolesModule } from 'src/roles/roles.module';
import ms from 'ms';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { RolesService } from 'src/roles/roles.service';

@Module({
  imports: [UsersModule, PassportModule, RolesModule,

    JwtModule.registerAsync({
      useFactory: async () => ({
        secretOrPrivateKey: process.env.JWT_ACCESS_SECRET,
        signOptions: {
          expiresIn: ms(process.env.JWT_ACCESS_EXPIRE) / 1000,
        },
      }),
    }),

    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema }
    ])

  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesService],
  exports: [AuthService]
})
export class AuthModule { }
