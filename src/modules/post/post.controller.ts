import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res, HttpStatus } from '@nestjs/common';
import { IRequest } from '../../interfaces/request.interface'
import { Response } from 'express'
import { PostService } from './post.service'
import { PostDto } from './dto/post.dto'
import { ParamsDto } from './dto/params.dto'
import { Schema } from 'mongoose'

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  async getAll(@Res() res: Response): Promise<void> {
    const posts = await this.postService.getAll()
    res.status(HttpStatus.OK).send(posts)
  }

  @Get(':id')
  async get(
    @Param() params: ParamsDto,
    @Res() res: Response
  ): Promise<void> {
    const post = await this.postService.get(params.id)
    res.status(HttpStatus.OK).send(post)
  }

  @Post()
  async create(
    @Req() req: IRequest,
    @Body() postDto: PostDto,
    @Res() res: Response
  ): Promise<void> {
    const post = await this.postService.create(req.user.id, postDto)
    res.status(HttpStatus.CREATED).send(post)
  }

  @Put(':id')
  async update(
    @Req() req: IRequest,
    @Param() params: ParamsDto,
    @Body() postDto: PostDto,
    @Res() res: Response
  ): Promise<void> {
    const post = await this.postService.edit(req.user.id, params.id, postDto)
    res.status(HttpStatus.OK).send(post)
  }

  @Delete(':id')
  async delete(
    @Req() req: IRequest,
    @Param() params: ParamsDto,
    @Res() res: Response
  ): Promise<void> {
    await this.postService.delete(req.user.id, params.id)
    res.status(HttpStatus.OK).send({
      message: 'Post has been removed'
    })
  }
}
