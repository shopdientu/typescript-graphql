import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Post } from './Post'
import { Upvote } from './Upvote'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field((_type) => String)
  @Column({ unique: true })
  username!: string

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]

  @OneToMany((_to) => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[]

  @Field((_type) => String)
  @Column({ unique: true })
  email!: string

  @Field((_type) => String)
  @Column()
  password!: string

  @Field()
  @CreateDateColumn()
  createAt: Date

  @Field()
  @UpdateDateColumn()
  updateAt: Date
}
