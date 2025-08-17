import { IsString, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class ClientCredentialsTokenDto {
  @IsString()
  grant_type: string;

  @IsString()
  client_id: string;

  @IsString()
  client_secret: string;

  @IsOptional()
  @IsString()
  scope?: string;
}

export class TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class TokenIntrospectionDto {
  @IsString()
  token: string;
}

export class TokenIntrospectionResponseDto {
  active: boolean;
  client_id?: string;
  scope?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;
}

export class CreateClientCredentialDto {
  @IsString()
  client_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateClientCredentialDto {
  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class RevokeTokenDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
