import { Controller, Get, Post, Body } from '@nestjs/common';
import  {InfoService} from "./info.service"
import { Info } from './info.entity';

@Controller('api/info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get()
  async getAllUsers(): Promise<Info[]> {
    return this.infoService.findAll();
  }

  @Post()
  async createUser(@Body() user: Partial<Info>): Promise<Info> {
    return this.infoService.create(user);
  }

}
