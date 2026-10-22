import { registerEnumType } from '@nestjs/graphql';
import { ApplicationStatus } from '../../generated/prisma/enums';

registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
  description: 'The stage an application is currently in.',
});

export { ApplicationStatus };
