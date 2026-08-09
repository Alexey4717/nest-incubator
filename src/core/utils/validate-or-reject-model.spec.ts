import { IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';

import { DomainExceptionCode } from '../errors/domain-exception-code.enum';
import { DomainException } from '../errors/domain.exception';
import { validateOrRejectModel } from './validate-or-reject-model';

class SampleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

describe('validateOrRejectModel', () => {
  it('resolves when model is a valid instance of the constructor', async () => {
    const model = Object.assign(new SampleDto(), { name: 'Alice' });

    await expect(validateOrRejectModel(model, SampleDto, 'SampleDto')).resolves.toBeUndefined();
  });

  it('throws DomainException ValidationError when model fails class-validator rules', async () => {
    const model = Object.assign(new SampleDto(), { name: '' });

    try {
      await validateOrRejectModel(model, SampleDto, 'SampleDto');
      fail('expected DomainException');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      expect(error).toMatchObject({
        code: DomainExceptionCode.ValidationError,
        extensions: [
          {
            field: 'name',
            message: 'name should not be empty',
          },
        ],
      });
    }
  });

  it('throws DomainException InternalServerError when model is not instanceof constructor', async () => {
    const plainModel = { name: 'Alice' };

    try {
      await validateOrRejectModel(plainModel, SampleDto, 'SampleDto');
      fail('expected DomainException');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      expect(error).toMatchObject({
        code: DomainExceptionCode.InternalServerError,
        extensions: [
          {
            field: null,
            message: 'SampleDto: inputModel not instanceof SampleDto',
          },
        ],
      });
    }
  });
});
