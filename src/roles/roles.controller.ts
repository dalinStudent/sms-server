import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { success } from "@/utils/response.util";
import { GetPaginationDto } from "@/common/pagination.dto";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post("create-role")
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.rolesService.create(createRoleDto);
    return success(
      {
        id: result.id,
        name: result.name,
        title: result.title,
        isSuperAdmin: result.isSuperAdmin,
      },
      "Create new role successfully!"
    );
  }

  @Post("get-all")
  async findAll(@Body() query: GetPaginationDto) {
    const result = await this.rolesService.findAll(query);
    return success({
      totalElements: result.totalElements,
      totalPages: result.totalPages,
      content: result.content,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.rolesService.remove(id);
  }
}
