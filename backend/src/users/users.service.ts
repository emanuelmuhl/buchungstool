import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Erstelle Standard-Admin wenn keine Benutzer existieren
    const userCount = await this.usersRepository.count();
    if (userCount === 0) {
      await this.createDefaultAdmin();
    }
  }

  private async createDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin = this.usersRepository.create({
      username: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Administrator',
      isActive: true,
    });

    await this.usersRepository.save(defaultAdmin);
    console.log('Default admin user created: admin/admin123');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Prüfe ob Username bereits existiert
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('Benutzername bereits vergeben');
    }

    // Hash das Passwort
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    
    // Passwort aus Response entfernen
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'username', 'role', 'firstName', 'lastName', 'email', 'isActive', 'createdAt', 'lastLogin']
    });
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'firstName', 'lastName', 'email', 'isActive', 'createdAt', 'lastLogin']
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username, isActive: true }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Prüfe Username-Eindeutigkeit bei Änderung
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username }
      });
      if (existingUser) {
        throw new ConflictException('Benutzername bereits vergeben');
      }
    }

    // Hash neues Passwort falls vorhanden
    if (updateUserDto.newPassword) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.newPassword, 10);
      delete updateUserDto.newPassword;
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Verhindere Löschung des letzten Admins
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN, isActive: true }
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Der letzte Administrator kann nicht gelöscht werden');
      }
    }

    await this.usersRepository.delete(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.updateLastLogin(user.id);

    const { password: _, ...result } = user;
    return result as User;
  }
}
