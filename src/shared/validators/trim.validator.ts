import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Trim' })
export class TrimValidator implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== 'string') {
      return true;
    }

    return value.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return "This field can't be empty";
  }
}
