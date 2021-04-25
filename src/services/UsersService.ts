import { getCustomRepository, Repository } from "typeorm";
import { User } from "../entities/User";
import { UsersRepository } from "../repositories/UsersRepository";

class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  };

  async create(email: string) {
    // Verificar se usuário existe
    const userExists = await this.usersRepository.findOne({
      email,
    });

    // Se existir, retornar user
    if (userExists) {
      return userExists;
    }

    // Se não existir, salvar no DB
    const user = this.usersRepository.create({
      email,
    });

    await this.usersRepository.save(user);

    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ email })
  }

  async listUsers() {
    const list = await this.usersRepository.find();

    return list;
  }
}

export { UsersService };