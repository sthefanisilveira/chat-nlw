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
    if(!this.id) { // O !this.id significa que o id não veio preenchido. Se não estiver preenchido, prossegue.
      this.id = uuid();  //Chamando a função que cria um id único
    }
  }
}

export { User };