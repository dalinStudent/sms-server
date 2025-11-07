import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  type?: 'SMS' | 'WhatsApp' | 'Email' | 'Telegram';

//   @ManyToOne(() => User, user => user.contacts)
//   user!: User;
}

