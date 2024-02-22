import mongoose from "mongoose";
import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post } from "@nestjs/common";
import { User } from "../Schema/User.Schema";
import { UserService } from "../uses-case/User";
import { FolderService } from "src/uses-case/Folder/folder.service";
import { CreatUserDto } from "../uses-case/User/DTO/CreatUser.dto";
import { CreateFolderDto } from "../uses-case/Folder/DTO/CreateFolder.dto";
import { UpdateFolderDto } from "../uses-case/Folder/DTO/UpdateFolder.dto";

@Controller('folder')
export class FolderController {
  constructor(private folderService: FolderService) {}


  @Post("addfolder/:parenid?")
  creatuser(@Body() folder: CreateFolderDto,
            @Param('parenid') parenid: string,
            ) {
    return this.folderService.AddFolder(folder,parenid);
  }

  @Delete('deletefolder/:id')
  async DeleteFolder(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('invalide ID', 400);
    const deletefolder= await this.folderService.DelteFolder(id);
    if(!deletefolder) throw new HttpException('user not found', 404);
    return deletefolder;
  }

  @Get('allfolder')
  GetAllFolder() {
    return this.folderService.FindAllFolder();
  }

@Get('onefolder/:folderid')
  GetOneFolder(@Param('folderid') userid: string) {
    return this.folderService.findOneFolder(userid);
  }



  @Patch('/update/:idfolder')
  async UpdateFolder(
    @Body() updatefolderdto: UpdateFolderDto,
    @Param('idfolder') id: string,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid ID', 400);
    const updtefolder = await this.folderService.UpdateFolder(id,updatefolderdto);
    if (!updtefolder) throw new HttpException('user not found', 404);
    return updtefolder;
  }

@Get("yourfolder/:userid")
  FindFolderByUser(@Param('userid') userid: string) {
    return this.folderService.FindFolderByUser(userid);
  }



  @Get("parentfolder/:parenid")
  FindFolderByParent(@Param('parenid') parenid: string) {
    return this.folderService.FindFolderByParent(parenid);
  }

}
