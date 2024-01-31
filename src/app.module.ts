import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
require('dotenv').config()

@Module({
  imports: [UsersModule, AuthModule,
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URL,
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      })
    }),
    PermissionsModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
