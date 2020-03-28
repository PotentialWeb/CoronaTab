import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Model } from './model'
import { v4 as uuid } from 'uuid'

@Entity()
export class Token extends Model<Token> {
  @PrimaryGeneratedColumn('uuid')
  id?: string = this['id'] ?? uuid()

  @Column()
  email: string
}
