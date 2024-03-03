import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SharedAssetsRepository } from "./Shared-Assets-Repo/SharedAssets.repository";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../Schema/User.Schema";
import mongoose, { Document, Model, Types } from "mongoose";
import { Folder } from "../../Schema/Folder.Schema";
import { Documents } from "../../Schema/Documents.Schema";
import { SharedAssets } from "../../Schema/SharedAssets.Schema";
import { CreateFolderDto } from "../Folder/DTO/CreateFolder.dto";
import { createSharedDto } from "./DTO/CreateShared.dto";
import { AccesLevel } from 'src/Schema/Enum/AccesLevel';

@Injectable()
export class SharedAssetsService {

  constructor(private SharedAssetsRepository: SharedAssetsRepository,
              @InjectModel(User.name) private userModel: Model<User>,
              @InjectModel(Folder.name) private folderModel: Model<Folder>,
              @InjectModel(Documents.name) private documentModel: Model<Documents>,
              @InjectModel(SharedAssets.name) private sharedModel: Model<SharedAssets>,
  ) {}



  async createSharedAssets(creatshareddto: createSharedDto) {
    if (!creatshareddto.Userid || creatshareddto.Userid.length === 0) {
      throw new HttpException('At least one User ID is required', HttpStatus.BAD_REQUEST);
    }

    // Vérifier l'existence du dossier ou du document associé
    if (creatshareddto.foldID) {
      const folder = await this.folderModel.findById(creatshareddto.foldID);
      if (!folder) {
        throw new HttpException('Folder not found with provided ID', HttpStatus.NOT_FOUND);
      }
    } else if (creatshareddto.docID) {
      const document = await this.documentModel.findById(creatshareddto.docID);
      if (!document) {
        throw new HttpException('Document not found with provided ID', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException('Either Folder ID or Document ID is required', HttpStatus.BAD_REQUEST);
    }

    const sharedAssetsList = [];

    if (creatshareddto.foldID) {
      // Si foldID est fourni, créer des SharedAssets pour le dossier et ses sous-dossiers
      const folder = await this.folderModel.findById(creatshareddto.foldID);
      for (const userId of creatshareddto.Userid) {
        const userIdString = userId.toString(); // Convertir l'ID utilisateur en chaîne de caractères
        const sharedAssets = new this.sharedModel({
          folderid: creatshareddto.foldID,
          userid: userIdString,
          acceslevel: creatshareddto.acceslevel,
        });
        sharedAssetsList.push(await sharedAssets.save());
      }
      await this.createSharedAssetsForSubfolders(folder, creatshareddto.Userid, creatshareddto.acceslevel);
    } else if (creatshareddto.docID) {
      // Si docID est fourni, créer des SharedAssets pour le document
      for (const userId of creatshareddto.Userid) {
        const userIdString = userId.toString(); // Convertir l'ID utilisateur en chaîne de caractères
        const sharedAssets = new this.sharedModel({
          docid: creatshareddto.docID,
          userid: userIdString,
          acceslevel: creatshareddto.acceslevel,
        });
        sharedAssetsList.push(await sharedAssets.save());
      }
    }

    return sharedAssetsList;
  }

  // Fonction récursive pour créer des SharedAssets pour les sous-dossiers
  private async createSharedAssetsForSubfolders(folder: Folder, userIds: string[], accessLevel: AccesLevel) {
    const subfolders = await this.folderModel.find({ parentfolder: folder._id });
    for (const subfolder of subfolders) {
      // Créer un SharedAssets pour chaque sous-dossier
      for (const userId of userIds) {
        const sharedAssetsFolder = new this.sharedModel({
          folderid: subfolder._id,
          userid: userId,
          acceslevel: accessLevel,
        });
        await sharedAssetsFolder.save();
      }

      // Créer un SharedAssets pour chaque document dans le sous-dossier
      const documents = await this.documentModel.find({ parentfolder: subfolder._id });
      for (const document of documents) {
        for (const userId of userIds) {
          const sharedAssetsDocument = new this.sharedModel({
            docid: document._id,
            userid: userId,
            acceslevel: accessLevel,
          });
          await sharedAssetsDocument.save();
        }
      }

      // Appeler récursivement la fonction pour les sous-sous-dossiers
      await this.createSharedAssetsForSubfolders(subfolder, userIds, accessLevel);
    }
  }







}
