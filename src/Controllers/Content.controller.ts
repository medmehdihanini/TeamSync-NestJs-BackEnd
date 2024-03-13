import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Public } from 'src/Custom Decorators/public.decorator';
import { Content } from "src/Schema/Content";
import { ContentService } from "src/uses-case/Content/content.service";

@Controller('content')
export class ContentController {


constructor( private contentService:ContentService){}

@Public()
@Post('add')
addContent(@Body() content:Content){
return this.contentService.addContent(content);
}

@Public()
@Patch('update')
modifyContent(@Body() content:Content){
return this.contentService.UpdateContent(content);
}
@Public()
@Public()
  @Delete('deleteone/:id')
  async deleteContent(@Param('id') id: string) {
    return this.contentService.deleteContent(id);
  }

  @Public()
@Public()
  @Delete('deleteByDoc/:id')
  async deleteContentByDoc(@Param('id') id: string) {
    return this.contentService.deleteContentByDoc(id);
  }

  @Public()
  @Public()
  @Get('getAllContentByDocId/:id')
  async getAllContentByDocId(@Param('id') id: string) {
    return this.contentService.getAllByDoc(id);
  }

  @Public()
  @Public()
  @Get('getContentById/:id')
  async getContentById(@Param('id') id: string) {
    return this.contentService.getcontentById(id);
  }
}
