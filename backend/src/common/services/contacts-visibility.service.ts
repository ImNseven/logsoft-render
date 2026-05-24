import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../../modules/deals/entities/deal.entity';
import { DealStatus, UserRole } from '../enums';

export type Viewer = { userId: string; role: UserRole; is_admin: boolean };

type MaskableUser = { id?: string; phone?: string | null } | null | undefined;

@Injectable()
export class ContactsVisibilityService {
  constructor(
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
  ) {}

  async canSeeContact(viewer: Viewer, targetUserId: string | undefined | null): Promise<boolean> {
    if (!targetUserId) return true;
    if (targetUserId === viewer.userId) return true;
    if (viewer.is_admin) return true;
    if (viewer.role === UserRole.DISPATCHER) return true;
    const count = await this.dealsRepo.count({
      where: [
        { shipperId: viewer.userId, carrierId: targetUserId, status: DealStatus.DOCUMENTS_REVEALED },
        { carrierId: viewer.userId, shipperId: targetUserId, status: DealStatus.DOCUMENTS_REVEALED },
      ],
    });
    return count > 0;
  }

  private hide(u: any) {
    u.phone = null;
    u.full_name = null;
    u.company_name = null;
  }

  async maskUser<T extends MaskableUser>(viewer: Viewer, user: T): Promise<T> {
    if (!user) return user;
    const ok = await this.canSeeContact(viewer, user.id);
    if (!ok) this.hide(user);
    return user;
  }

  async maskMany<T extends MaskableUser>(viewer: Viewer, users: T[]): Promise<void> {
    const ids = Array.from(new Set(users.filter((u) => !!u?.id).map((u) => u!.id!)));
    if (ids.length === 0) return;
    const allowed = new Set<string>();
    for (const id of ids) {
      if (await this.canSeeContact(viewer, id)) allowed.add(id);
    }
    for (const u of users) {
      if (u && u.id && !allowed.has(u.id)) this.hide(u);
    }
  }
}
