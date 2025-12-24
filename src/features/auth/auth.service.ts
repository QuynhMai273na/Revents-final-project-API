// import { BadRequestException, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as bcrypt from 'bcrypt';
// import { PrismaService } from '../prisma/prisma.service';
// import { SignUpDto } from './dto/sign-up.dto';
// import { SignInDto } from './dto/sign-in.dto';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly configService: ConfigService,
//     private readonly jwtService: JwtService,
//   ) {}

//   async signUp(signUpDto: SignUpDto) {
//     const { email, password, displayName } = signUpDto;

//     const user = await this.prisma.user.findUnique({
//       where: {
//         email,
//       },
//     });

//     if (user) {
//       throw new BadRequestException({
//         field: 'email',
//         message: 'Email already in use',
//       });
//     }

//     const saltRounds = this.configService.get('saltRounds');
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     await this.prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         displayName,
//       },
//     });

//     return {
//       message: 'User created successfully',
//     };
//   }

//   async signIn(signInDto: SignInDto) {
//     const { email, password } = signInDto;

//     const user = await this.prisma.user.findUnique({
//       where: {
//         email,
//       },
//     });

//     if (!user) {
//       throw new BadRequestException({
//         field: 'email',
//         message: 'Invalid email',
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       throw new BadRequestException({
//         field: 'password',
//         message: 'Invalid password',
//       });
//     }

//     const payload = {
//       id: user.id,
//       email: user.email,
//     };

//     const accessToken = await this.jwtService.signAsync(payload, {
//       secret: this.configService.get('jwt.secret'),
//       expiresIn: this.configService.get('jwt.expiresIn'),
//     });

//     return {
//       message: 'User signed in successfully',
//       data: {
//         accessToken,
//       },
//     };
//   }
// }
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, displayName } = signUpDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException({
        field: 'email',
        message: 'Email already in use',
      });
    }

    const saltRounds = this.configService.get('saltRounds');
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
      },
    });

    return {
      message: 'User created successfully',
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException({
        field: 'email',
        message: 'Invalid email',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException({
        field: 'password',
        message: 'Invalid password',
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    return {
      message: 'User signed in successfully',
      data: {
        accessToken,
      },
    };
  }
  async getMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        hostedEvents: true,
        attendances: {
          include: {
            event: true,
          },
        },
        followers: true,
        following: true,
      },
    });

    return {
      data: user,
    };
  }
}
