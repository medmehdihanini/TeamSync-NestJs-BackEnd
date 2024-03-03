import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { User } from "../../Schema/User.Schema";
import { UserRepository } from "./UserRepo/user.repository";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreatUserDto } from "./DTO/CreatUser.dto";
import { Settings } from "../../Schema/Settings.Schema";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./DTO/Login.dto";
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import EmailService from "../email/email.service";

@Injectable()
export class UserService {

  constructor(
    private readonly emailService: EmailService,
    private readonly userRe: UserRepository, @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Settings.name) private SettingsModel: Model<Settings>
  ) {
  }

  async CreatUser({ settings, ...creatUserDto }: CreatUserDto) {
    let randomNumber: number;
    let usernameWithNumber: string;
    let userExists: boolean;
    const existingUser = await this.userRe.findOne({ email: creatUserDto.email });
    if (existingUser) {
      throw new Error("There is already an account with this email.");
    }
    do {
      randomNumber = Math.floor(Math.random() * 10000);
      const paddedNumber = randomNumber.toString().padStart(4, '0');
      usernameWithNumber = `${creatUserDto.username}#${paddedNumber}`;
      userExists = await this.userRe.findUserWithNumber(usernameWithNumber);
    } while (userExists);

    const saltOrRounds = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
    const password = creatUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    const isMatch = await bcrypt.compare(creatUserDto.password, hash);
    const newuser = new this.userModel({
      ...creatUserDto,
      password: hash,
      username: usernameWithNumber,
      isEmailConfirmed: false,
      isTwoFactorAuthenticationEnabled:false,
      twoFactorAuthenticationSecret:'',
      passResetToken:''
    });

    console.log("Hash: ", hash);
    console.log("Are The Password and the hash are matched? : ", isMatch);
    console.log("The New User: ", newuser);

    return await newuser.save();
  }

  async loginUser(loginDto: LoginDto) {
    const user = await this.userRe.findOne({ email: loginDto.email });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect");
    }
    return user;
  }


  deleteUser(id: string) {
    return this.userRe.delete(id);

  }

  findAllUser() {
    return this.userRe.findAll();
  }

  findOneUser(id: string) {
    return this.userRe.findById(id);
  }

  findUserByEmail(email: string) {
    return this.userRe.findByEmail(email);
  }


  UpdateUser(id: string, creatuserdto: CreatUserDto) {
    return this.userRe.update(id, creatuserdto);
  }

  async markEmailAsConfirmed(id: string) {
    return this.userRe.update(id, {
      isEmailConfirmed: true
    });
  }


  //@Cron("*/10 * * * * *")
  async deleteUnconfirmedUsers() {
    try {
      //console.log("10s");
      const deletedUsers = await this.userModel.deleteMany({ isEmailConfirmed: false });
      if (deletedUsers.deletedCount > 0) {
        console.log(`${deletedUsers.deletedCount} user(s) were deleted.`);
        console.log('Deleted users:', deletedUsers);
      }
    } catch (error) {
      console.error('Error deleting unconfirmed users:', error);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return this.userRe.update(userId, {
      twoFactorAuthenticationSecret: secret
    });
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return this.userRe.update(userId, {
      isTwoFactorAuthenticationEnabled: true
    });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRe.update(userId, {
      currentHashedRefreshToken
    });
  }

  async sendPasswordResetEmail(email: string) {
   const user = await this.userRe.findByEmail( email );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `http://localhost:3000/auth/resetpw?token=${resetToken}&email=${email}`;
    const text = resetUrl;
    await this.userRe.update(user.id,{passResetToken : resetToken})
    await this.emailService.sendMail({
      to: email,
      subject: 'Password Reset',
      text,
    })
  }
}




