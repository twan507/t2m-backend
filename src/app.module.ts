import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { LicensesModule } from './licenses/licenses.module';
import { ProductsModule } from './products/products.module';
import { MailModule } from './mail/mail.module';
import { FilesModule } from './files/files.module';
import { ScheduleModule } from '@nestjs/schedule';
require('dotenv').config()

@Module({
  imports: [UsersModule, AuthModule, 
    
    ScheduleModule.forRoot(),

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
    RolesModule,
    DatabasesModule,
    LicensesModule,
    ProductsModule,
    MailModule,
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
