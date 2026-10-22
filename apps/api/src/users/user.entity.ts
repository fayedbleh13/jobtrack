import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;
}
