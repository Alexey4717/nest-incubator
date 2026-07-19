import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiGetHello() {
  return applyDecorators(
    ApiOperation({ summary: 'Health check endpoint' }),
    ApiOkResponse({
      description: 'Returns hello message',
      schema: { type: 'string', example: 'Hello World!' },
    }),
  );
}
