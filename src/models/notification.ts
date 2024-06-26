import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'notifications'
})
class Notification extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id!: number;

  @Column(DataType.INTEGER)
  public complaintId!: number;

  @Column(DataType.STRING)
  public message!: string;

  @Column(DataType.DATE)
  public date!: Date;
}

export default Notification;
