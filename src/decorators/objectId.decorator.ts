import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import * as mongoose from 'mongoose'

export function ObjectId(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: ObjectIdConstraint,
      });
  };
}

@ValidatorConstraint({name: 'ObjectId'})
export class ObjectIdConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
      return mongoose.Types.ObjectId.isValid(value)
  }
}