import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import {
  ClientCredentialsTokenDto,
  TokenIntrospectionDto,
  CreateClientCredentialDto,
  UpdateClientCredentialDto,
  RevokeTokenDto,
} from './dto/oauth.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * OAuth 2.0 Token Endpoint
   * POST /oauth/token
   */
  @Post('token')
  async getToken(@Body() tokenDto: ClientCredentialsTokenDto) {
    return this.oauthService.issueToken(tokenDto);
  }

  /**
   * OAuth 2.0 Token Introspection Endpoint
   * POST /oauth/introspect
   */
  @Post('introspect')
  async introspectToken(@Body() introspectDto: TokenIntrospectionDto) {
    return this.oauthService.introspectToken(introspectDto);
  }

  /**
   * Create client credential (Admin only)
   * POST /oauth/clients
   */
  @Post('clients')
  @UseGuards(JwtAuthGuard)
  async createClientCredential(
    @Body() createDto: CreateClientCredentialDto,
    @Request() req: any
  ) {
    return this.oauthService.createClientCredential(createDto, req.user);
  }

  /**
   * Get all client credentials (Admin only)
   * GET /oauth/clients
   */
  @Get('clients')
  @UseGuards(JwtAuthGuard)
  async getClientCredentials(@Request() req: any) {
    return this.oauthService.getClientCredentials(req.user);
  }

  /**
   * Update client credential (Admin only)
   * PUT /oauth/clients/:clientId
   */
  @Put('clients/:clientId')
  @UseGuards(JwtAuthGuard)
  async updateClientCredential(
    @Param('clientId') clientId: string,
    @Body() updateDto: UpdateClientCredentialDto,
    @Request() req: any
  ) {
    return this.oauthService.updateClientCredential(clientId, updateDto, req.user);
  }

  /**
   * Delete client credential (Admin only)
   * DELETE /oauth/clients/:clientId
   */
  @Delete('clients/:clientId')
  @UseGuards(JwtAuthGuard)
  async deleteClientCredential(
    @Param('clientId') clientId: string,
    @Request() req: any
  ) {
    return this.oauthService.deleteClientCredential(clientId, req.user);
  }

  /**
   * Revoke service token (Admin only)
   * POST /oauth/revoke
   */
  @Post('revoke')
  @UseGuards(JwtAuthGuard)
  async revokeToken(
    @Body() revokeDto: RevokeTokenDto,
    @Request() req: any
  ) {
    return this.oauthService.revokeToken(revokeDto, req.user);
  }
}
