import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
    private userRepo: Repository<User>,
    private mailService: MailService
  ) {}

  private generateActivationKey(): string {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  async create(createUserDto: CreateUserDto, creatorId: number): Promise<User> {
    const verificationKey = randomBytes(20).toString("hex");
    const expire = new Date();
    expire.setHours(expire.getHours() + 24);

    const user = this.userRepo.create({
      ...createUserDto,
      role: createUserDto.role || "ROLE_USER",
      isActive: createUserDto.isActive ?? false,
      createdBy: creatorId,
      updatedBy: creatorId,
      verificationKey,
      verificationExpire: expire,
    });

    const savedUser = await this.userRepo.save(user);
    await this.mailService.sendVerificationEmail(
      savedUser.email,
      verificationKey
    );
    return savedUser;
  }

  async getAllUsers(query: GetPaginationDto) {
  const { page, size, searchBy, fromDate, toDate } = query;

  const qb = this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.updatedByUser', 'modifier')
    .leftJoinAndSelect('user.createdByUser', 'creator')
    .orderBy('user.createdAt', 'DESC')
    .skip((page - 1) * size)
    .take(size);

  if (fromDate) qb.andWhere('user.createdAt >= :fromDate', { fromDate });
  if (toDate) qb.andWhere('user.createdAt <= :toDate', { toDate });
  if (searchBy)
    qb.andWhere(
      '(user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s)',
      { s: `%${searchBy}%` }
    );

  const [content, totalElements] = await qb.getManyAndCount();

const formatted = content.map(u => ({
  ...u,
  updatedBy: u.updatedByUser
    ? `${u.updatedByUser.firstName} ${u.updatedByUser.lastName}`
    : null,
  createdBy: u.createdByUser
    ? `${u.createdByUser.firstName} ${u.createdByUser.lastName}`
    : null,
  updatedByUser: undefined,
  createdByUser: undefined,
}));

  const totalPages = Math.ceil(totalElements / size);

  return {
    totalElements,
    totalPages,
    content: formatted,
  };
}

  // async findAll(query: GetPaginationDto) {
  //   const { page, size, fromDate, toDate, searchBy } = query;

  //   const qb = this.userRepo
  //     .createQueryBuilder("user")
  //     .orderBy("user.createdAt", "DESC")
  //     .skip((page - 1) * size)
  //     .take(size);

  //   if (fromDate) {
  //     qb.andWhere("user.createdAt >= :fromDate", { fromDate });
  //   }

  //   if (toDate) {
  //     qb.andWhere("user.createdAt <= :toDate", { toDate });
  //   }

  //   if (searchBy) {
  //     qb.andWhere(
  //       "(user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s)",
  //       {
  //         s: `%${searchBy}%`,
  //       }
  //     );
  //   }

  //   const [content, totalElements] = await qb.getManyAndCount();

  //   const totalPages = Math.ceil(totalElements / size);

  //   return {
  //     totalElements,
  //     totalPages,
  //     content,
  //   };
  // }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findProfile(id: number): Promise<User | undefined | null> {
    const result = this.userRepo.findOneBy({ id });
    return result;
  }

  async getDetailUser(id: number): Promise<any> {
    const result = await this.userRepo.findOneBy({ id });
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

  async getUpdateUser(id: number, data: Partial<User>, modifierId: number) {
    if (!id) throw new BadRequestException("User ID required");
    if (!data || Object.keys(data).length === 0)
      throw new BadRequestException("No data provided");

    const userToUpdate = await this.userRepo.preload({
      id,
      ...data,
      updatedBy: modifierId,
    });

    if (!userToUpdate) throw new NotFoundException("User not found");

    const updatedUser = await this.userRepo.save(userToUpdate);
    const modifieredBy = await this.userRepo.findOne({
      where: { id: updatedUser.id },
      relations: ["updatedByUser"],
    });

return success(
null,
    'Update User successfully!'
  );
  }

  async deleteUser(id: number) {
    const result = await this.userRepo.delete(id);

    const deleted = (result.affected ?? 0) > 0;

    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return success(null, "Deleted user successfully!");
  }

  async findByActivationKey(activateKey: string) {
    return this.userRepo.findOne({
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
    await this.userRepo.save(user);

    return success(
      { id: user.id, email: user.email },
      "User activated successfully!"
    );
  }

  async resendActivationKey(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const newKey = randomBytes(20).toString("hex");
    user.verificationKey = newKey;
    user.verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepo.save(user);

    await this.mailService.sendVerificationEmail(user.email, newKey);

    return success(null, "Verification email resent successfully!");
  }

  async blockUser(id: number, block: boolean) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.isActive = !block;
    await this.userRepo.save(user);

    return success(
      { id: user.id, email: user.email, isActive: user.isActive },
      block ? "User blocked successfully!" : "User unblocked successfully!"
    );
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepo.update(id, {
      lastLogin: new Date(),
    });
  }
}
