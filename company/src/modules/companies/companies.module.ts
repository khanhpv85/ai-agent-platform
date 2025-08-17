import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { AuthClientService } from '@services/auth-client.service';
import { Company } from './entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, UserCompany, User])],
  controllers: [CompaniesController],
  providers: [CompaniesService, ServiceJwtGuard, AuthClientService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
