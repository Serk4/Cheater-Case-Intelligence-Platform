<!-- PHASE 2.4: AUTHENTICATION & RBAC - QUICK REFERENCE GUIDE -->

# CCIP Authentication & RBAC - Quick Reference

## Import Statements

```typescript
// All auth utilities from the auth module
import {
  Auth,              // @Auth() - Combined auth + role decorator
  Roles,             // @Roles() - Role-specific decorator
  AuthGuard,         // AuthGuard - JWT validation
  RoleGuard,         // RoleGuard - Role-based access control
  AuthService,       // AuthService - Auth logic
  CurrentUser,       // @CurrentUser() - Inject authenticated user
  LoginDto,          // LoginDto - Login request validation
  SignupDto,         // SignupDto - Signup request validation
} from '../auth';
```

## Common Usage Patterns

### 1. Protect Route (Any Authenticated User)

```typescript
import { Controller, Get } from '@nestjs/common';
import { Auth } from '../auth';

@Controller('dashboard')
@Auth()  // Requires any authenticated user
export class DashboardController {
  @Get()
  getDashboard() {
    return { message: 'Dashboard data' };
  }
}
```

### 2. Protect Route (Specific Roles)

```typescript
import { Controller, Post } from '@nestjs/common';
import { Auth } from '../auth';

@Controller('users')
@Auth('ADMIN')  // Only ADMIN role
export class UsersController {
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    // Only admins can create users
  }
}
```

### 3. Multiple Allowed Roles

```typescript
@Controller('cases')
@Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')  // Any of these roles
export class CasesController {
  @Get()
  listCases() {
    // Analysts and higher can access
  }
}
```

### 4. Inject Current User

```typescript
import { Get } from '@nestjs/common';
import { Auth, CurrentUser } from '../auth';

@Get('profile')
@Auth()
getProfile(@CurrentUser() user: User) {
  // user is automatically injected from JWT
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

### 5. Public Endpoint (No Auth Required)

```typescript
@Post('auth/signup')
@Public()  // Skip auth guards
signup(@Body() dto: SignupDto) {
  return this.authService.signup(dto);
}
```

## DTOs

### LoginDto
```typescript
{
  email: string;      // Required, valid email
  password: string;   // Required, min 8 chars
}
```

### SignupDto
```typescript
{
  email: string;      // Required, valid email
  displayName: string; // Required, min 2 chars
  password: string;   // Required, min 8 chars
}
```

## User Roles

| Role | Level | Access |
|------|-------|--------|
| VIEWER | 1 | Read-only, view cases/reports |
| ANALYST | 2 | Create/update cases, add notes |
| SENIOR_ANALYST | 3 | Manage cases, create verdicts, restricted notes |
| ADMIN | 4 | Full system access, user management |

## API Endpoints

### Authentication

```
POST   /auth/signup     - Register new user
POST   /auth/login      - Get JWT token
POST   /auth/refresh    - Refresh token (requires valid JWT)
```

### Protected Routes

```
GET    /users           - List users (auth required)
POST   /users           - Create user (ADMIN only)
GET    /users/:id       - Get user (auth required)
PATCH  /users/:id       - Update user (ADMIN only)
DELETE /users/:id       - Delete user (ADMIN only)

GET    /cases           - List cases (ANALYST+)
POST   /cases           - Create case (ANALYST+)
GET    /cases/:id       - Get case (ANALYST+)
PATCH  /cases/:id       - Update case (ANALYST+)
```

## Example: Complete Protected Controller

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Auth, CurrentUser } from '../auth';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { User } from '@prisma/client';

@Controller('cases')
@ApiTags('Cases')
@ApiBearerAuth()
@Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  listCases() {
    return this.casesService.findAll();
  }

  @Post()
  createCase(
    @Body() dto: CreateCaseDto,
    @CurrentUser() user: User,
  ) {
    return this.casesService.create(dto, user.id);
  }

  @Get(':id')
  getCase(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }
}
```

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION_TIME=3600  # seconds (1 hour)
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be at least 8 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required roles: ADMIN"
}
```

## Success Responses

### Login/Signup Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz123...",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "ANALYST"
  }
}
```

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "displayName": "John Doe",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid token" | Check JWT_SECRET matches, verify token not expired |
| "Insufficient permissions" | User role doesn't match required role for endpoint |
| "User not found" | User deleted or email incorrect |
| "Invalid email or password" | Check credentials, password case-sensitive |
| CORS errors | Check backend CORS configuration |
| Token not sent | Use `Authorization: Bearer <token>` header |

## Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Use strong, randomly generated JWT_SECRET (min 32 chars)
3. ✅ Store JWT in secure storage (HttpOnly cookie or sessionStorage)
4. ✅ Implement token refresh logic on frontend
5. ✅ Add rate limiting to auth endpoints
6. ✅ Log all authentication attempts
7. ✅ Implement password reset flow
8. ✅ Use role-based route guards on frontend
9. ✅ Validate tokens on every protected request
10. ✅ Implement session timeout for security

## See Also

- [Authentication Documentation](./docs/authentication.md)
- [Prisma Schema](./backend/prisma/schema.prisma)
- [NestJS Security Guide](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
