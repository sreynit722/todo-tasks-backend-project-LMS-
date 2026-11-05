import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    // Returns the saved User instance; the interceptor strips passwordHash
    return this.usersRepository.save(
      this.usersRepository.create({ email: dto.email, password: hash }),
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOneBy({ email: dto.email });
    const passwordOk =
      user !== null && (await bcrypt.compare(dto.password, user.password));

    // Same message for "no such email" and "wrong password"
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
