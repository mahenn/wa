import { Contact } from '@adiwajshing/baileys/src';
import { Label } from '@adiwajshing/baileys/src/Types/Label';

export interface ILabelsRepository {
  getById(id: string): Promise<Label | null>;

  getAll(): Promise<Label[]>;

  getAllByIds(ids: string[]): Promise<Label[]>;

  deleteById(id: string): Promise<void>;

  save(label: Label): Promise<void>;
}
