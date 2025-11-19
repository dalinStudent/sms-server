import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { success } from "@/utils/response.util";
import { GetPaginationDto } from "@/common/pagination.dto";
import { User } from "./entities/user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("create-user")
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    return success(
      {
        firstName: result.firstName,
        lastName: result.lastName,
        phoneNumber: result.phoneNumber,
        cidNumber: result.cidNumber,
        staffId: result.staffId,
        deptName: result.deptName,
        email: result.email,
        role: result.role,
        avatar: result.avatar,
        isActive: result.isActive,
      },
      "Create new users successfully!"
    );
  }

  @Post("get-all")
  async findAll(@Body() query: GetPaginationDto) {
    const result = await this.usersService.findAll(query);

    return success({
      totalElements: result.totalElements,
      totalPages: result.totalPages,
      content: result.content,
    });
  }

  @Post("get-user")
  findOne(@Body() body: { id: number }) {
    return this.usersService.findOne(body.id);
  }

  @Post("update-user")
  async updateUser(@Body() body: { id: number; data: Partial<User> }) {
    return this.usersService.update(body.id, body.data);
  }

  @Post("delete-user")
  remove(@Body() body: { id: number }) {
    return this.usersService.remove(body.id);
  }

  @Post("resend-activation-key")
  async resendActivationKey(@Body() body: { id: number }) {
    return this.usersService.resendActivationKey(body.id);
  }

  @Post("block-user")
  async blockUser(@Body() body: { id: number; block: boolean }) {
    return this.usersService.blockUser(body.id, body.block);
  }
}
