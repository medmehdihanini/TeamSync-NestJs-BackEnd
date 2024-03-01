import {
    Controller,
    ClassSerializerInterceptor,
    UseInterceptors,
    Post,
    Body,
    UseGuards,
    Req,
  } from '@nestjs/common';
import { Public } from 'src/Custom Decorators/public.decorator';
import ConfirmEmailDto from 'src/uses-case/Auth/EmailConfirmation/confirmEmail.dto';
import { EmailConfirmationService } from 'src/uses-case/Auth/EmailConfirmation/emailConfirmation.service';
import RequestWithUser from 'src/uses-case/Auth/requestWithUser.interface';
 

   
  @Controller('email-confirmation')
  @UseInterceptors(ClassSerializerInterceptor)
  export class EmailConfirmationController {
    constructor(
      private readonly emailConfirmationService: EmailConfirmationService
    ) {}
    @Public()
    @Post('confirm')
    async confirm(@Body() confirmationData: ConfirmEmailDto) {
      const email = await this.emailConfirmationService.decodeConfirmationToken(confirmationData.token);
      await this.emailConfirmationService.confirmEmail(email);
    }
    
    @Post('resend-confirmation-link')
    async resendConfirmationLink(@Req() request: RequestWithUser) {
      await this.emailConfirmationService.resendConfirmationLink(request.user.id);
    }
  }