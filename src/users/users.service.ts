import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetPaginationDto } from "@/common/pagination.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || "user",
      isActive: createUserDto.isActive ?? true,
    });
    return this.usersRepository.save(user);
  }

  async findAll(query: GetPaginationDto) {
    const { page, size, fromDate, toDate, searchBy } = query;
  
    const qb = this.usersRepository
      .createQueryBuilder("user")
      .orderBy("user.createdAt", "DESC")
      .skip((page - 1) * size)
      .take(size);
  
    if (fromDate) {
      qb.andWhere("user.createdAt >= :fromDate", { fromDate });
    }

    if (toDate) {
      qb.andWhere("user.createdAt <= :toDate", { toDate });
    }
  
    if (searchBy) {
      qb.andWhere("(user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s)", {
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

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User | undefined | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findById(id: number): Promise<User | undefined | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateUserDto: Partial<User>
  ): Promise<User | undefined | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.usersRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
