import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { Repository } from "typeorm";
import { GetPaginationDto } from "@/common/pagination.dto";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private _roleRepo: Repository<Role>
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = this._roleRepo.create({
      ...createRoleDto,
    });
    const saveRole = await this._roleRepo.save(role);
    return saveRole;
  }

  async findAll(query: GetPaginationDto) {
    const { page, size, fromDate, toDate, searchBy } = query;
    const qb = this._roleRepo
      .createQueryBuilder("role")
      .orderBy("role.createdAt", "DESC")
      .skip((page - 1) * size)
      .take(size);
    if (fromDate) {
      qb.andWhere("role.createdAt >= : fromDate", { fromDate });
    }

    if (toDate) {
      qb.andWhere("role.createdAt <= : toDate", { toDate });
    }
    if (searchBy) {
      qb.andWhere("(role.name ILIKE :s OR role.title ILIKE :s)", {
        s: `%${searchBy}%`,
      });
    }
    const [content, totalElements] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalElements / size);

    return {
      totalElements,
      totalPages,
      content,
    };
  }

  async findOne(id: number): Promise<Role | undefined | null> {
    return await this._roleRepo.findOneBy({ id });
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto
  ): Promise<Role | undefined | null> {
    await this._roleRepo.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this._roleRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
