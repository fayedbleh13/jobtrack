import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Contact')
export class ContactModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  role: string | null;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  linkedin: string | null;
}
