import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { success } from "@/utils/response.util";
import { GetPaginationDto } from "@/common/pagination.dto";
import { User } from "./entities/user.entity";
import { AuthGuard } from "@nestjs/passport";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("create-user")
  @UseGuards(AuthGuard("jwt"))
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const creatorId = req.user.id;
    const result = await this.usersService.create(createUserDto, creatorId);

    return success(
      {
        ...result,
      },
      "Create new users successfully!"
    );
  }

  @Post("get-all")
  async findAll(@Body() query: GetPaginationDto) {
    const result = await this.usersService.getAllUsers(query);

    return success({
      totalElements: result.totalElements,
      totalPages: result.totalPages,
      content: result.content,
    });
  }

  @Post("get-user")
  findOne(@Body() body: { id: number }) {
    return this.usersService.getDetailUser(body.id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("update-user")
  async updateUser(@Req() req: any, @Body() body: Partial<User>) {
    const modifierId = req.user.id;
    if (!body.id) throw new BadRequestException("User ID required");

    const { id, ...data } = body;

    if (Object.keys(data).length === 0)
      throw new BadRequestException("No data provided");

    return this.usersService.getUpdateUser(id, data, modifierId);
  }

  @Post("delete-user")
  remove(@Body() body: { id: number }) {
    return this.usersService.deleteUser(body.id);
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
