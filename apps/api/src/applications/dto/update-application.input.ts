import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateApplicationInput } from './create-application.input';

@InputType()
export class UpdateApplicationInput extends PartialType(
  OmitType(CreateApplicationInput, ['status'] as const),
) {}
