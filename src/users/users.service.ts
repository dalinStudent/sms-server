import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { randomBytes } from "crypto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetPaginationDto } from "@/common/pagination.dto";
import { MailService } from "@/mail/mail.service";
import { success } from "@/utils/response.util";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const verificationKey = randomBytes(20).toString("hex");
    const expire = new Date();
    expire.setHours(expire.getHours() + 24);

    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role || "ROLE_USER",
      isActive: createUserDto.isActive ?? false,
      verificationKey,
      verificationExpire: expire,
    });

    const savedUser = await this.usersRepository.save(user);
    await this.mailService.sendVerificationEmail(
      savedUser.email,
      verificationKey
    );
    return savedUser;
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
      qb.andWhere(
        "(user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s)",
        {
          s: `%${searchBy}%`,
        }
      );
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

  async activateUser(email: string, key: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
  
    if (!user) {
      throw new NotFoundException("User not found");
    }
  
    if (user.isActive) {
      return success({ id: user.id, email: user.email }, "User is already activated");
    }
  
    if (user.verificationKey !== key) {
      throw new NotFoundException("Invalid activation key");
    }
  
    user.isActive = true;
    user.verificationKey = null;
    await this.usersRepository.save(user);
  
    return success(
      { id: user.id, email: user.email },
      "User activated successfully!"
    );
  }  
}
