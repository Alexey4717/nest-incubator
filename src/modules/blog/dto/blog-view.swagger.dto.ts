import { ApiProperty } from '@nestjs/swagger';

import { PaginatedMetaDto } from '@/core/swagger/paginated-meta.dto';

export class BlogViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'Blog name' })
  name = '';

  @ApiProperty({ example: 'https://example.com' })
  websiteUrl = '';

  @ApiProperty({ example: 'Blog description' })
  description = '';

  @ApiProperty({ example: false })
  isMembership = false;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt = '';
}

export class PaginatedBlogsViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [BlogViewDto] })
  items: BlogViewDto[] = [];
}
