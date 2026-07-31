import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { Roles } from './roles.decorator';

export const Auth = (...roles: string[]) => {
  if (roles.length === 0) {
    return applyDecorators(UseGuards(AuthGuard));
  }
  return applyDecorators(
    UseGuards(AuthGuard, RoleGuard),
    Roles(...roles),
  );
};
