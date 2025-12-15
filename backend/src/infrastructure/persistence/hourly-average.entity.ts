import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('hourly_averages')
@Index(['symbol', 'hour'], { unique: true })
export class HourlyAverageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  average: number;

  @Column({ type: 'varchar', length: 50 })
  hour: string;

  @Column({ type: 'int' })
  count: number;

  @CreateDateColumn()
  createdAt: Date;
}
