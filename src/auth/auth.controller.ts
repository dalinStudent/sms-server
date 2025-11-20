import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { AuthGuard } from "@nestjs/passport";
import { Request as ExpressRequest } from "express";

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
    private usersService: UsersService,
  ) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithCredentials(body.email, body.password);
  }

@UseGuards(AuthGuard("jwt"))
@Get("profile")
async getProfile(@Request() req: AuthenticatedRequest) {
  return {
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
  };
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
