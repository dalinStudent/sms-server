import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !user.isActive ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new UnauthorizedException(
        "Invalid credentials or account not verified"
      );
    }
    await this.usersService.updateLastLogin(user.id);
    const updatedUser = await this.usersService.findByEmail(email);
    const payload = {
      sub: updatedUser?.id,
      email: updatedUser?.email,
      role: updatedUser?.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      status: {
        message: "Login successful",
        code: 0,
      },
      data: {
        access_token: token,
        data: {
          access_token: token,
          user: {
            id: updatedUser?.id,
            email: updatedUser?.email,
            firstName: updatedUser?.firstName,
            lastName: updatedUser?.lastName,
            role: updatedUser?.role,
            lastLogin: updatedUser?.lastLogin,
          },
        },
      },
    };
  }
}
