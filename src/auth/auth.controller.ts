import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request as ExpressRequest } from "express";
import { success } from "@/utils/response.util";

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: "User registered", userId: user.id };
  }

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithCredentials(body.email, body.password);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  async getProfile(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new UnauthorizedException("User not found in request");
    }

    const user = await this.usersService.findOne(req.user.id);

    if (!user) {
      throw new NotFoundException("User does not exist");
    }

    return success(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      "Get profile successfully!"
    );
  }
}
