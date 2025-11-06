import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class InviteUserDto {
  @IsNotEmpty()
  @IsUUID()
  listId!: string; // Add !

  @IsNotEmpty()
  @IsEmail()
  email!: string; // Add !
}
