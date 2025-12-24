import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayload } from './auth.interface';

export const CurrentUser = createParamDecorator(
  (field: keyof AuthPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return field ? request.user?.[field] : request.user;
  },
);
