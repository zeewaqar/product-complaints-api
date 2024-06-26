import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'complaints'
})
class Complaint extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id!: number;

  @Column(DataType.INTEGER)
  public productId!: number;

  @Column(DataType.STRING)
  public customerName!: string;

  @Column(DataType.STRING)
  public customerEmail!: string;

  @Column(DataType.DATE)
  public date!: Date;

  @Column(DataType.STRING)
  public description!: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [['Open', 'InProgress', 'Rejected', 'Accepted', 'Canceled']]
    }
  })
  public status!: string;
}

export default Complaint;
