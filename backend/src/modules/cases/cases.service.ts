import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseListQueryDto } from './dto/case-list.query.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.case.findMany({
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
        subjects: true,
        reports: true,
        evidence: true,
        notes: true,
        verdict: true,
        violationTypes: true,
        auditLogs: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
        subjects: true,
        reports: true,
        evidence: true,
        notes: true,
        verdict: true,
        violationTypes: true,
        auditLogs: true,
      },
    });
  }

  create(data: CreateCaseDto) {
    return this.prisma.case.create({
      data,
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
      },
    });
  }

  update(id: string, data: UpdateCaseDto) {
    return this.prisma.case.update({
      where: { id },
      data,
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.case.delete({
      where: { id },
    });
  }

  async getCaseById(id: string) {
    const caseRecord = await this.prisma.case.findUniqueOrThrow({
      where: { id },
      include: {
        game: true,
        openedBy: true,
        assignedTo: true,

        subjects: {
          include: { platform: true },
        },

        reports: {
          include: {
            reportedBy: true,
            integrationSource: true,
          },
          orderBy: { createdAt: 'asc' },
        },

        evidence: {
          include: {
            uploadedBy: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },

        notes: {
          include: {
            author: true,
            attachments: true,
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'asc' },
          ],
        },

        verdict: {
          include: {
            sanctionTemplate: true,
            renderedBy: true,
          },
        },

        violationTypes: {
          include: {
            violationType: true,
          },
        },
      },
    });

    // Flatten join table
    const violationTypes = caseRecord.violationTypes.map(v => v.violationType);

    return {
      ...caseRecord,
      violationTypes,
    };
  }

  async getCaseSubjects(caseId: string) {
    return this.prisma.subject.findMany({
      where: { caseId },
      include: { platform: true },
    });
  }

  async getCaseReports(caseId: string) {
    return this.prisma.report.findMany({
      where: { caseId },
      include: {
        reportedBy: true,
        integrationSource: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCaseEvidence(caseId: string) {
    return this.prisma.evidence.findMany({
      where: { caseId },
      include: {
        uploadedBy: true,
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCaseNotes(caseId: string) {
    return this.prisma.note.findMany({
      where: { caseId },
      include: {
        author: true,
        attachments: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async getCaseVerdict(caseId: string) {
    return this.prisma.verdict.findUnique({
      where: { caseId },
      include: {
        sanctionTemplate: true,
        renderedBy: true,
      },
    });
  }

  async listCases(query: CaseListQueryDto) {
    const {
      status,
      priority,
      assignedToId,
      openedFrom,
      openedTo,
      sortBy = 'openedAt',
      sortDir = 'desc',
      page = 1,
      pageSize = 20,
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    if (openedFrom || openedTo) {
      where.openedAt = {};
      if (openedFrom) where.openedAt.gte = openedFrom;
      if (openedTo) where.openedAt.lte = openedTo;
    }

    const total = await this.prisma.case.count({ where });

    const data = await this.prisma.case.findMany({
      where,
      include: {
        openedBy: true,
        assignedTo: true,
      },
      orderBy: {
        [sortBy]: sortDir,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async createNote(dto: CreateNoteDto) {
    const { caseId, authorId, body, visibility, isPinned } = dto;

    // Ensure case exists
    await this.prisma.case.findUniqueOrThrow({
      where: { id: caseId },
    });

    // Ensure author exists
    await this.prisma.user.findUniqueOrThrow({
      where: { id: authorId },
    });

    const existingNotes = await this.prisma.note.count({ where: { caseId } });

    const note = await this.prisma.note.create({
        data: {
          caseId,
          authorId,
          body,
          visibility: visibility ?? 'INTERNAL',
          isPinned: existingNotes === 0 ? true : isPinned ?? false, // Auto-pin if it's the first note
        },
        include: {
          author: true,
          attachments: true,
        },
      });

      return note;
  }

  async softDeleteNote(id: string) {
    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

async createEvidence(dto: CreateEvidenceDto, files: Express.Multer.File[]) {
  const {
    caseId,
    uploadedById,
    title,
    description,
    evidenceType,
    metadata,
    capturedAt,
  } = dto;

  if (!files || files.length === 0) {
    throw new Error('At least one file upload is required.');
  }

  // Ensure case exists
  await this.prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  // Ensure user exists
  await this.prisma.user.findUniqueOrThrow({
    where: { id: uploadedById },
  });

  // Create the Evidence record
  const evidence = await this.prisma.evidence.create({
    data: {
      caseId,
      uploadedById,
      title,
      description,
      evidenceType: evidenceType ?? 'OTHER',
      metadata,
      capturedAt: capturedAt ? new Date(capturedAt) : null,
    },
  });

  // Create Attachment rows for each uploaded file
  const attachments = await Promise.all(
    files.map((file) =>
      this.prisma.attachment.create({
        data: {
          evidenceId: evidence.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageKey: `evidence/${file.filename}`,
          storageUrl: `/uploads/evidence/${file.filename}`,
        },
      })
    )
  );

  // Return Evidence with all attachments included
  return {
    ...evidence,
    attachments,
  };
}

}
