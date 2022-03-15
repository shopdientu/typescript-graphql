import { User } from './User'
import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Upvote } from './Upvote'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  title!: string

  @Field()
  @Column()
  userId!: number

  @Field((_type) => User)
  @ManyToOne(() => User, (user) => user.posts)
  user: User

  @OneToMany((_to) => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[]

  @Field()
  @Column({ default: 0 })
  points!: number

  @Field()
  @Column()
  text!: string

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updateAt: Date
}
