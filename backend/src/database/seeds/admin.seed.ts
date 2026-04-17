import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(User);

  const existing = await repo.findOneBy({ phone: '+70000000000' });
  if (existing) return;

  const user = repo.create({
    phone: '+70000000000',
    password_hash: await bcrypt.hash('admin123', 10),
    role: UserRole.DISPATCHER,
    full_name: 'System Admin',
    company_name: 'Platform Admin',
    is_admin: true,
  });

  await repo.save(user);
}
