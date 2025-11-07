import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';
import { Message } from './message.entity';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Contact)
  contact!: Contact;

  @ManyToOne(() => Message)
  template!: Message;

  @Column()
  status!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
