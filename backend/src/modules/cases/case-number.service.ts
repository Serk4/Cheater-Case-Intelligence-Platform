import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CaseNumberService {
  constructor(private prisma: PrismaService) {}

  async generate(gameId: string): Promise<string> {
    // 1. Get game short code
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { shortCode: true },
    });

    if (!game) {
      throw new Error(`Game not found for id: ${gameId}`);
    }

    const short = game.shortCode.toUpperCase();

    // 2. Build date prefix
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yyyy}${mm}${dd}`;

    // 3. Count existing cases for this game + date
    const count = await this.prisma.case.count({
      where: {
        gameId,
        caseNumber: {
          startsWith: `CASE-${short}-${datePart}-`,
        },
      },
    });

    // 4. Sequence number
    const seq = String(count + 1).padStart(4, '0');

    // 5. Final case number
    return `CASE-${short}-${datePart}-${seq}`;
  }
}
