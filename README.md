<h1 align="center">
  Chat em tempo real
</h1>

## 📌 Sobre

Este é um chat para atendimentos de suporte, onde usuário e atendente podem trocar mensagens em tempo real. 
O projeto foi desenvolvido durante a trilha de Node.js da **Next Level Week-5** oferecida pela [Rocketseat](https://rocketseat.com.br/). 

## 🛠 Tecnologias utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias

- Node.js
- WebSocket
- TypeScript
- Express

## 📂 Como baixar o projeto

```bash

# Clonar o repositório
$ git clone https://github.com/sthefanisilveira/chat-nlw

# Entrar no diretório
$ cd chat-nlw

# Instalar as dependências
$ yarn install

# Iniciar o projeto
$ yarn dev
 
```

## 💻 Desenvolvimento

Durante o desenvolvimento do projeto, criei uma documentação em formato de **passo a passo** para absorver o conteúdo. Descrevi a regra de negócio que a aplicação deveria seguir e todo o processo de inclusão de uma nova tabela e seu relacionamento utilizando **Migrations**.

## Regra de negócio

- O usuário pode habilitar/desabilitar o chat;
- O usuário pode iniciar uma conversa no chat;
- O usuário deverá ter um id único (UUID);
- O admin pode responder a mensagem enviada pelo usuário;
- O sistema irá guardar usuário, mensagem, configurações e conexão;
- Para validar se uma mensagem foi enviada pelo usuário ou admin, na tabela Messages será verificado se o admin_id está preenchido. Se sim, a mensagem é do admin, se não, é do usuário.

## Inclusão de uma nova tabela 

Neste tópico apresento um passo a passo para a inclusão de uma nova tabela no projeto. Aqui estou utilizando o exemplo da tabela **users**.

- Criação de migration

Foi criada uma tabela utilizando o migration para se ter um gerenciamento/histórico do banco de dados através da linha de comando.

```
$ yarn typeorm migration:create -n CreateUsers

```

- Criação da tabela e colunas dentro da migration

Dentro do arquivo gerado foi criada a estrutura da tabela com suas colunas e especificações. O script ``` yarn typeorm migration:run ```  foi rodado no terminal para criação da tabela  no banco de dados.

```ts

import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUsers1619199484153 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true
                    },
                    {
                        name: "email",
                        type: "varchar"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
}

```

- Criação de uma entity

Criação de uma entidade que contém as informações da tabela do banco de dados. Isso é feito para “trazer” para o projeto as colunas da tabela criada no bd. Com o Typeorm é possível fazer o mapeamento da tabela (utilizando os “@”). No construtor já está sendo feita a verificação do id do usuário: se não possuir um id, será gerado um id único (isso é possível pela biblioteca uuid instalada).

```ts

import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("users")
class User {

  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if(!this.id) { 
      this.id = uuid();  
    }
  }
}

export { User };

```

- Criação de um repository

O repositório deve ser criado para conter a entidade, pois ele irá fazer a comunicação entre a entidade e a tabela. É uma classe responsável por fazer a manipulação de dados da aplicação.

```ts

import { EntityRepository, Repository } from "typeorm";
import { User } from "../entities/User";

@EntityRepository(User)
class UsersRepository extends Repository<User> {}

export { UsersRepository };

```

- Criação de um service

O service conterá toda a regra de negócio. Aqui, será verificado se o usuário já existe, pesquisando pelo seu e-mail. Se não existir, ele será cadastrado no BD. Se existir, as suas informações serão apresentadas.


```ts

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

```

- Criação de um controller

O controller irá cuidar das requisições. Ou seja, utilizando o request e o response do Express, o controller irá transmitir a informação do response vindo do service (por meio de um json) para o request vindo do request.body. 

```ts

import { Request, Response } from "express";
import { UsersService } from "../services/UsersService";

class UsersController {
  async create(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const usersService = new UsersService();

    const user = await usersService.create(email);

    return response.json(user);
  }
}

export { UsersController };

```

- Criação de uma rota para teste

A rota deve ser criada chamando o controller.

```ts

import { Router } from "express";
import { UsersController } from "./controllers/UsersController";

const routes = Router();

const usersController = new UsersController();

routes.post("/users", usersController.create);

export { routes };

```

## Relacionamento ManyToOne

O projeto possui um relacionamento entre as tabelas de Messages e Users. Uma mensagem deve ter um usuário e um usuário pode ter uma ou muitas mensagens.
Dessa forma, ao criar a tabela de Messages, foi necessário incluir o campo “user_id” como uma Foreign Key (Chave estrangeira). Isto foi implementado nos seguintes passos:

- Na Migration Messages, após definir as colunas, foi necessário especificar o uso da foreign key, como na imagem abaixo. Os itens “onDelete” e “onUpdate” servem para definir que caso o user seja deletado ou atualizado, a FK deverá receber o valor como nulo.

```ts
foreignKeys: [
                    {
                        name: "FKUser",
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        columnNames: ["user_id"],
                        onDelete: "SET NULL",
                        onUpdate: "SET NULL",
                    },
                ],
```

- Na Entity Message, para que o projeto entenda que há um relacionamento de Muitos para Um entre as tabelas de Message e User, basta importar a coluna de user e definí-la com o Typeorm como um relacionamento ManyToOne. Também é importante definir um Join entre as colunas de User e user_id.

```ts

@JoinColumn({ name: "user_id" })
  @ManyToOne(() => User)
  user: User;

```

---
Desenvolvido com 💜 por [Sthéfani Silveira](https://www.linkedin.com/in/sthefani-silveira/)
