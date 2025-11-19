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

    const user = await this.usersService.findProfile(req.user.id);

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

  @Post("activate")
  async activate(@Body() body: { activateKey: string; password: string }) {
    const { activateKey, password } = body;
    const result = await this.usersService.activateUser(activateKey, password);
    return result;
  }

  @Post("resend-activation-key")
  async resendActivationKey(@Body() body: { id: number }) {
    return this.usersService.resendActivationKey(body.id);
  }
}
