import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { randomBytes } from "crypto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetPaginationDto } from "@/common/pagination.dto";
import { MailService } from "@/mail/mail.service";
import { success } from "@/utils/response.util";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService
  ) {}

  private generateActivationKey(): string {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }

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

  async findProfile(id: number): Promise<User | undefined | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOne(id: number): Promise<any> {
    const result = await this.usersRepository.findOneBy({ id });
    return success(
      {
        id: result?.id,
        firstName: result?.firstName,
        lastName: result?.lastName,
        email: result?.email,
        gender: result?.gender,
        cidNumber: result?.cidNumber,
        staffId: result?.staffId,
        deptName: result?.deptName,
        password: result?.password,
        phoneNumber: result?.phoneNumber,
        role: result?.role,
        isActive: result?.isActive,
        avatar: result?.avatar,
        createdAt: result?.createdAt,
      },
      "Get Detail successfully!"
    );
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

  async findByActivationKey(activateKey: string) {
    return this.usersRepository.findOne({
      where: { verificationKey: activateKey },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async activateUser(activateKey: string, password: string) {
    const user = await this.findByActivationKey(activateKey);
    if (!user) throw new NotFoundException("Invalid activation key");

    if (user.isActive) {
      return success(
        { id: user.id, email: user.email },
        "User is already activated"
      );
    }

    user.password = await this.hashPassword(password);
    user.isActive = true;
    user.verificationKey = null;
    await this.usersRepository.save(user);

    return success(
      { id: user.id, email: user.email },
      "User activated successfully!"
    );
  }

  async resendActivationKey(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const newKey = randomBytes(20).toString("hex");
    user.verificationKey = newKey;
    user.verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, newKey);

    return success(null, "Verification email resent successfully!");
  }

  async blockUser(id: number, block: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    user.isActive = !block;
    await this.usersRepository.save(user);
  
    return success(
      { id: user.id, email: user.email, isActive: user.isActive },
      block ? 'User blocked successfully!' : 'User unblocked successfully!'
    );
  }  
}
