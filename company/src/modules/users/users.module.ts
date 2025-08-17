import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserCompany } from './entities/user-company.entity';
import { Company } from '@modules/companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCompany, Company])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
