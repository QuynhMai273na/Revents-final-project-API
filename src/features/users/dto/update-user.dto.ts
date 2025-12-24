import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export default class UpdateUserDto extends PartialType(CreateUserDto) {}
