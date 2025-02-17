
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Info } from './info.entity';

@Injectable()
export class InfoService {
  constructor(
    @InjectRepository(Info)
    private usersRepository: Repository<Info>,
  ) {}

  findAll(): Promise<Info[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<Info | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
  async create(user: Partial<Info>): Promise<Info> {
    return this.usersRepository.save(user);
  }
}
