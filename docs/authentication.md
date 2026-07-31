# Authentication & RBAC Implementation Guide

## Overview

This document describes the authentication and role-based access control (RBAC) system implemented in CCIP Phase 2.4.

## Authentication Strategy

CCIP uses **JWT (JSON Web Tokens)** for stateless authentication with the following flow:

1. **User Registration** (`POST /auth/signup`)
   - Email and password-based user creation
   - Passwords are hashed using bcrypt (salt rounds: 10)
   - Default role: `VIEWER`

2. **User Login** (`POST /auth/login`)
   - Email/password authentication
   - Returns JWT token valid for 1 hour (configurable via `JWT_EXPIRATION_TIME`)

3. **Token Validation**
   - All protected routes validate the JWT using Passport.js JWT strategy
   - Token payload contains: `sub` (user ID), `email`, `role`

## Roles & Permissions

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `VIEWER` | Read-only access | View cases, reports, evidence |
| `ANALYST` | Standard reviewer | Can create/update cases, add notes, upload evidence |
| `SENIOR_ANALYST` | Lead reviewer | Can manage cases, create verdicts, view restricted notes |
| `ADMIN` | Full system access | User management, system configuration, all operations |

### Protected Routes

#### Authentication Required (`@Auth()`)
- Any authenticated user can access these routes
- Example: `GET /cases` - all ANALYST+ can list cases

#### Role-Based Access (`@Auth('ADMIN')`)
- Only users with specified roles can access
- Example: `POST /users` - ADMIN only

## Implementation

### Database Schema

**User Model** (Prisma):
```prisma
model User {
  id          String
  email       String    @unique
  displayName String
  passwordHash String?  // null for SSO users
  role        UserRole  @default(VIEWER)
  isActive    Boolean   @default(true)
  // ... timestamps and relations
}

enum UserRole {
  VIEWER
  ANALYST
  SENIOR_ANALYST
  ADMIN
}
```

### Decorators & Guards

#### `@Auth()` - Combined Authentication + RBAC
```typescript
// Any authenticated user
@Auth()
@Get('cases')
getCases() {}

// Specific roles required
@Auth('ADMIN')
@Post('users')
createUser(@Body() dto: CreateUserDto) {}

// Multiple roles allowed
@Auth('SENIOR_ANALYST', 'ADMIN')
@Post(':caseId/verdict')
createVerdict() {}
```

#### `@CurrentUser()` - Inject Authenticated User
```typescript
@Get('me')
@Auth()
getCurrentUser(@CurrentUser() user: User) {
  return user;
}
```

#### `@Roles()` - Fine-grained Role Control
```typescript
@Get('analytics')
@UseGuards(AuthGuard, RoleGuard)
@Roles('SENIOR_ANALYST', 'ADMIN')
getAnalytics() {}
```

### Controllers

#### AuthController (`/auth`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Get JWT token
- `POST /auth/refresh` - Refresh token (requires valid JWT)

#### UsersController (`/users`)
- `GET /users` - List users (requires auth)
- `GET /users/:id` - Get user details (requires auth)
- `POST /users` - Create user (ADMIN only)
- `PATCH /users/:id` - Update user (ADMIN only)
- `DELETE /users/:id` - Delete user (ADMIN only)

#### CasesController (`/cases`)
- All routes require: `@Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')`
- Creates audit trail for all case operations

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION_TIME=3600  # seconds (1 hour)
```

### Setup for Development

```bash
cd backend
npm install
# Update .env with JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

## Usage Examples

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "displayName": "John Analyst",
    "password": "SecurePassword123!"
  }'

# Returns:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz...",
    "email": "analyst@example.com",
    "displayName": "John Analyst",
    "role": "VIEWER"
  }
}

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "SecurePassword123!"
  }'
```

### Access Protected Routes

```bash
# With valid token
curl -X GET http://localhost:3000/cases \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Without token → 401 Unauthorized
# With insufficient role → 403 Forbidden
```

## Security Best Practices

1. **JWT_SECRET** - Use a strong, randomly generated secret (min 32 characters)
2. **HTTPS** - Always use HTTPS in production to prevent token interception
3. **Token Expiration** - Default 1 hour; adjust based on use case
4. **Password Policy** - Enforce strong passwords (min 8 chars, mixed case, numbers)
5. **Rate Limiting** - Add rate limits to `/auth/login` to prevent brute force
6. **Audit Logging** - All authentication events are logged via AuditLog
7. **SSO Support** - User model supports `passwordHash: null` for future SSO integration

## Future Enhancements

- [ ] Refresh token rotation
- [ ] OAuth2/OIDC integration
- [ ] Multi-factor authentication (MFA)
- [ ] API key support for service-to-service auth
- [ ] Session management & device tracking
- [ ] LDAP/Active Directory integration
- [ ] Permission-based access control (fine-grained ACL)

## Troubleshooting

### "Invalid token"
- Ensure JWT_SECRET matches between auth module and .env
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

### "Insufficient permissions"
- User role doesn't match required roles for the endpoint
- Admin must assign appropriate role to user
- Check @Auth() decorator on controller method

### "User not found or inactive"
- User account may be disabled (isActive: false)
- User was deleted
- Check User model in database

## See Also

- [Prisma Schema](../prisma/schema.prisma)
- [JWT Documentation](https://jwt.io)
- [Passport.js JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
