import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as appleSignIn from 'apple-signin-auth';
import { User } from '../database/entities/user.entity';
import { RegisterDto, LoginDto, AppleAuthDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private generateMemberNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000).toString();
    return `JIN-${timestamp}${random}`;
  }

  private generateToken(user: User): { accessToken: string } {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('このメールアドレスは既に登録されています');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const memberNumber = this.generateMemberNumber();

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName || dto.email.split('@')[0],
      memberNumber,
    });

    await this.userRepository.save(user);

    return {
      ...this.generateToken(user),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        memberNumber: user.memberNumber,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    return {
      ...this.generateToken(user),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        memberNumber: user.memberNumber,
        createdAt: user.createdAt,
      },
    };
  }

  async appleLogin(dto: AppleAuthDto): Promise<{ accessToken: string; user: Partial<User> }> {
    let applePayload: { sub: string; email?: string };

    try {
      applePayload = await appleSignIn.verifyIdToken(dto.identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
    } catch (err) {
      throw new UnauthorizedException('Apple IDトークンが無効です');
    }

    const appleId = applePayload.sub;
    if (!appleId) {
      throw new BadRequestException('Apple IDの取得に失敗しました');
    }

    let user = await this.userRepository.findOne({ where: { appleId } });

    if (!user) {
      const memberNumber = this.generateMemberNumber();
      user = this.userRepository.create({
        appleId,
        email: applePayload.email || null,
        displayName: dto.displayName || `仁ファン${memberNumber.slice(-4)}`,
        memberNumber,
      });
      await this.userRepository.save(user);
    }

    return {
      ...this.generateToken(user),
      user: {
        id: user.id,
        email: user.email,
        appleId: user.appleId,
        displayName: user.displayName,
        memberNumber: user.memberNumber,
        createdAt: user.createdAt,
      },
    };
  }
}
