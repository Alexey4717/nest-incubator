import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

export function ApiDeleteAllData() {
  return applyDecorators(
    ApiOperation({ summary: 'Clear all data (for testing purposes only)' }),
    ApiNoContentResponse({ description: 'All data deleted' }),
  );
}
