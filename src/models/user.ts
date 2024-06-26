import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'users'
})
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id!: number;

  @Unique // Add this line to enforce unique constraint on username
  @Column(DataType.STRING)
  public username!: string;

  @Column(DataType.STRING)
  public password!: string;
}

export default User;
