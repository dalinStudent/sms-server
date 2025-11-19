import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Contact } from './contacts/entities/contact.entity';
import { Message } from './messages/entities/message.entity';
import { MessageLog } from './messages/entities/message-log.entity';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { ContactsModule } from './contacts/contacts.module';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'sms_db',
      synchronize: true,
      logging: false,
      entities: [User, Contact, Message, MessageLog, Auth, Role],
    }),
    TypeOrmModule.forFeature([User, Contact, Message, MessageLog, Role]),
    UsersModule,
    MessagesModule,
    AuthModule,
    MessagesModule,
    ContactsModule,
    MailModule,
    RolesModule
  ],
})
export class AppModule {}
