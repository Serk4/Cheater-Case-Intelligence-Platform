import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CaseNumberService {
  constructor(private prisma: PrismaService) {}

  async generate(gameId: string): Promise<string> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { shortCode: true },
    });

    if (!game) {
      throw new Error(`Game not found for id: ${gameId}`);
    }

    const short = game.shortCode.toUpperCase();

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yyyy}${mm}${dd}`;

    // Atomic increment — safe under concurrent requests.
    // The UPDATE returns the new counter value; if no row exists we get 0
    // and the subsequent upsert initialises it at 1.
    const result = await this.prisma.$queryRaw<{ counter: number }[]>`
      INSERT INTO case_number_counters ("id", "gameId", "date", "counter", "updatedAt")
      VALUES (gen_random_uuid(), ${gameId}, ${datePart}, 1, now())
      ON CONFLICT ("gameId", "date")
      DO UPDATE SET "counter" = case_number_counters."counter" + 1, "updatedAt" = now()
      RETURNING "counter"
    `;

    const seq = String(result[0].counter).padStart(4, '0');
    return `CASE-${short}-${datePart}-${seq}`;
  }
}
