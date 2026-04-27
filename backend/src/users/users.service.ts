import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
    return user;
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.findById(userId);
    // passwordHashは返さない
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.findById(userId);

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await this.userRepository.save(user);

    const { passwordHash, ...profile } = user;
    return profile;
  }
}
