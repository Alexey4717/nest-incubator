import { Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { validate } from 'class-validator';
import 'reflect-metadata';

import { errorFormatter } from './error-formatter';

class FlatDto {
  @IsString()
  @IsNotEmpty()
  email!: string;
}

class UserNameDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

class NestedObjectDto {
  @ValidateNested()
  @Type(() => UserNameDto)
  user!: UserNameDto;
}

class ItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

class ArrayOfObjectsDto {
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];
}

describe('errorFormatter', () => {
  it('formats flat DTO validation errors', async () => {
    const dto = plainToInstance(FlatDto, { email: '' });
    const errors = await validate(dto);
    const formatted = errorFormatter(errors);

    expect(formatted).toEqual([
      {
        field: 'email',
        message: 'email should not be empty',
      },
    ]);
  });

  it('formats nested object validation errors', async () => {
    const dto = plainToInstance(NestedObjectDto, { user: { name: '' } });
    const errors = await validate(dto);
    const formatted = errorFormatter(errors);

    expect(formatted).toEqual([
      {
        field: 'user.name',
        message: 'name should not be empty',
      },
    ]);
  });

  it('formats array of objects validation errors', async () => {
    const dto = plainToInstance(ArrayOfObjectsDto, { items: [{ title: '' }] });
    const errors = await validate(dto);
    const formatted = errorFormatter(errors);

    expect(formatted).toEqual([
      {
        field: 'items.0.title',
        message: 'title should not be empty',
      },
    ]);
  });
});
