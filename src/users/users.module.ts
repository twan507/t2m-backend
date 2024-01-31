import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      // { name: Role.name, schema: RoleSchema }
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
