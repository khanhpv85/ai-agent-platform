import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all users in a company' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getCompanyUsers(@Param('companyId') companyId: string, @Request() req) {
    return this.usersService.getCompanyUsers(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Request() req) {
    return this.usersService.getUser(id, req.user.id);
  }

  @Post('company/:companyId')
  @ApiOperation({ summary: 'Add user to company' })
  @ApiResponse({ status: 201, description: 'User added to company successfully' })
  async addUserToCompany(
    @Param('companyId') companyId: string,
    @Body() createUserDto: CreateUserDto,
    @Request() req,
  ) {
    return this.usersService.addUserToCompany(companyId, createUserDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user.id);
  }

  @Delete('company/:companyId/user/:userId')
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiResponse({ status: 200, description: 'User removed from company successfully' })
  async removeUserFromCompany(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.usersService.removeUserFromCompany(companyId, userId, req.user.id);
  }
}
