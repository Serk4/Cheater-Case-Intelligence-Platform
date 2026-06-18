import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCaseViolationTypeDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  violationTypeId: string;
}
