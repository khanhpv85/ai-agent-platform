/**
 * OAuth-related interfaces
 */

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface TokenIntrospectionResponse {
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
