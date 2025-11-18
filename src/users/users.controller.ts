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

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
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
        isActive: result.isActive
      },
      "Create new users successfully!"
    );
  }

@Post('get-all')
async findAll(@Body() query: GetPaginationDto) {
  const result = await this.usersService.findAll(query);

  return success({
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    content: result.content,
  });
}

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.usersService.remove(id);
  }
}
