# Change Password Error Clarification

## Problem
The `PUT /auth/change-password` endpoint was returning a 401 Unauthorized error for both:
1. Invalid/expired JWT token (authentication failure)
2. Incorrect current password (authorization failure)

This created confusion because both scenarios returned the same HTTP status code but for different reasons.

## Solution
We've updated the endpoint to return different HTTP status codes for different error scenarios:

### Error Scenarios

#### 1. **401 Unauthorized** - Authentication Failure
- **Cause**: Invalid, expired, or missing JWT token
- **When it occurs**: 
  - No Authorization header provided
  - Invalid JWT token format
  - Expired JWT token
  - Token signature verification failed
- **Response**: Standard authentication error response

#### 2. **400 Bad Request** - Authorization Failure  
- **Cause**: Incorrect current password provided
- **When it occurs**: 
  - Valid JWT token (user is authenticated)
  - But the `current_password` field in the request body is incorrect
- **Response**: Bad request error with message "Current password is incorrect"

#### 3. **200 OK** - Success
- **Cause**: Valid JWT token and correct current password
- **Response**: Success message "Password changed successfully"

## Code Changes Made

### 1. Updated Auth Service (`auth/src/modules/auth/auth.service.ts`)
```typescript
// Before
if (!isCurrentPasswordValid) {
  throw new UnauthorizedException('Current password is incorrect');
}

// After  
if (!isCurrentPasswordValid) {
  throw new BadRequestException('Current password is incorrect');
}
```

### 2. Updated Controller Documentation (`auth/src/modules/auth/auth.controller.ts`)
```typescript
@ApiResponse({ status: 200, description: 'Password changed successfully', type: PasswordChangeResponseSchema })
@ApiResponse({ status: 400, description: 'Current password is incorrect', type: BadRequestErrorResponseSchema })
@ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
```

### 3. Updated Schema Documentation (`auth/src/schemas/auth.schema.ts`)
```typescript
ChangePassword: [
    { status: 200, description: 'Password changed successfully', type: PasswordChangeResponseSchema },
    { status: 400, description: 'Current password is incorrect', type: BadRequestErrorResponseSchema },
    { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
],
```

## HTTP Status Code Meanings

### 400 Bad Request
- **Semantic meaning**: The request is malformed or contains invalid data
- **Use case**: Client provided incorrect current password
- **Client action**: Check the current password and retry

### 401 Unauthorized  
- **Semantic meaning**: Authentication is required and has failed
- **Use case**: Invalid, expired, or missing JWT token
- **Client action**: Re-authenticate (login again) to get a new token

### 403 Forbidden
- **Semantic meaning**: Authentication succeeded but authorization failed
- **Use case**: User doesn't have permission to change passwords
- **Client action**: Contact administrator for permissions

## Testing the Endpoint

### Test Case 1: Valid Request
```bash
curl -X PUT http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer <valid_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "correct_password",
    "new_password": "new_password123"
  }'
```
**Expected**: 200 OK with success message

### Test Case 2: Incorrect Current Password
```bash
curl -X PUT http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer <valid_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "wrong_password",
    "new_password": "new_password123"
  }'
```
**Expected**: 400 Bad Request with "Current password is incorrect"

### Test Case 3: Invalid Token
```bash
curl -X PUT http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer <invalid_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "correct_password",
    "new_password": "new_password123"
  }'
```
**Expected**: 401 Unauthorized

### Test Case 4: Missing Token
```bash
curl -X PUT http://localhost:3001/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "correct_password",
    "new_password": "new_password123"
  }'
```
**Expected**: 401 Unauthorized

## Benefits of This Change

1. **Clear Error Distinction**: Clients can now distinguish between authentication and authorization failures
2. **Better User Experience**: Frontend can show appropriate error messages
3. **Proper HTTP Semantics**: Status codes now correctly reflect the nature of the error
4. **Easier Debugging**: Developers can quickly identify the root cause of failures
5. **Standards Compliance**: Follows REST API best practices for HTTP status codes

## Frontend Implementation Example

```typescript
async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const response = await fetch('/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (response.status === 200) {
      showSuccessMessage('Password changed successfully');
    } else if (response.status === 400) {
      showErrorMessage('Current password is incorrect');
    } else if (response.status === 401) {
      // Token is invalid, redirect to login
      redirectToLogin();
    }
  } catch (error) {
    showErrorMessage('An error occurred while changing password');
  }
}
```

## Conclusion

This change resolves the confusion between authentication and authorization errors in the change password endpoint. Now clients can properly handle different error scenarios and provide appropriate feedback to users.
