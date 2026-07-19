import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMetaDto {
  @ApiProperty({ example: 1 })
  page = 0;

  @ApiProperty({ example: 10 })
  pageSize = 0;

  @ApiProperty({ example: 1 })
  pagesCount = 0;

  @ApiProperty({ example: 0 })
  totalCount = 0;
}
