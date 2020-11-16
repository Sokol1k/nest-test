import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import { PostDto } from './dto/post.dto'

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getAll(): Promise<PostDocument[]> {
    try {
      const posts = await this.postModel.find().populate('userId', '-password')
      return posts
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async get(id: string): Promise<PostDocument> {
    try {
      const post = await this.postModel.findById(id).populate('userId', '-password')
      return post
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async create(id: Schema.Types.ObjectId, postDto: PostDto): Promise<PostDocument> {
    try {
      const post = new this.postModel({
        ...postDto,
        userId: id
      })
      await post.save()
      return post
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async edit(userId: string, id: string, postDto: PostDto): Promise<PostDocument> {
    try {
      const post = await this.postModel.findById(id).populate('userId', '-password')

      if (!post) {
        throw new HttpException({
          message: 'There is no such post'
        }, HttpStatus.NOT_FOUND)
      }

      if (String(userId) !== String(post.userId._id)) {
        throw new HttpException({
          message: 'This is not your post'
        }, HttpStatus.FORBIDDEN)
      }

      post.title = postDto.title
      post.description = postDto.description
      await post.save()
      return post
    } catch(error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    try {
      const post = await this.postModel.findById(id).populate('userId', '-password')

      if (!post) {
        throw new HttpException({
          message: 'There is no such post'
        }, HttpStatus.NOT_FOUND)
      }

      if (String(userId) !== String(post.userId._id)) {
        throw new HttpException({
          message: 'This is not your post'
        }, HttpStatus.FORBIDDEN)
      }

      await post.remove()
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
