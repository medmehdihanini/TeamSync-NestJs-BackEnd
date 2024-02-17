import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from "mongoose";
import { Document } from 'mongoose';
import { Role } from "./Enum/Role";
@Schema()
export class CollaboorationLog extends Document{

  @Prop({ required: false })
  action: string;


  @Prop({ required: false })
  timesstamp: Date;

  @Prop({ required: false })
  documentid: string;

  @Prop({ required: false })
  userid: string;

}
export const CollaboorationLogSchema = SchemaFactory.createForClass(CollaboorationLog);