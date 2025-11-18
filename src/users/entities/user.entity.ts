import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true, nullable: true })
  staffId!: string;

  @Column({ nullable: true })
  deptName!: string;

  @Column({ nullable: true })
  cidNumber!: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  phoneNumber!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 'ROLE_USER' })
  role!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  verificationKey: string | null = null;
  
  @Column({ type: 'timestamp', nullable: true })
  verificationExpire: Date | null = null;
  
}
