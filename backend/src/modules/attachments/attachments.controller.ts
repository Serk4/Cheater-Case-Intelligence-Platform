import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { AttachmentsService } from './attachments.service'
import { CreateAttachmentDto } from './dto/create-attachment.dto'
import { UpdateAttachmentDto } from './dto/update-attachment.dto'

@Controller('attachments')
@ApiTags('Evidence')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AttachmentsController {
	constructor(private readonly attachmentsService: AttachmentsService) {}

	@Post()
	@ApiOperation({
		summary: 'Create attachment metadata',
		description: 'Creates an attachment record (metadata for evidence files)',
	})
	@ApiBody({ type: CreateAttachmentDto })
	@ApiResponse({
		status: 201,
		description: 'Attachment created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid attachment data',
	})
	create(@Body() createAttachmentDto: CreateAttachmentDto) {
		return this.attachmentsService.create(createAttachmentDto)
	}

	@Get()
	@ApiOperation({
		summary: 'List all attachments',
		description: 'Retrieves all evidence attachments in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Attachments retrieved successfully',
	})
	findAll() {
		return this.attachmentsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific attachment',
		description: 'Retrieves metadata about a single evidence attachment',
	})
	@ApiParam({
		name: 'id',
		description: 'The attachment ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Attachment retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Attachment not found',
	})
	findOne(@Param('id') id: string) {
		return this.attachmentsService.findOne(id)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update an attachment',
		description: 'Modifies attachment metadata',
	})
	@ApiParam({
		name: 'id',
		description: 'The attachment ID',
	})
	@ApiBody({ type: UpdateAttachmentDto })
	@ApiResponse({
		status: 200,
		description: 'Attachment updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Attachment not found',
	})
	update(
		@Param('id') id: string,
		@Body() updateAttachmentDto: UpdateAttachmentDto,
	) {
		return this.attachmentsService.update(id, updateAttachmentDto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete an attachment',
		description: 'Removes an evidence attachment from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The attachment ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Attachment deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Attachment not found',
	})
	remove(@Param('id') id: string) {
		return this.attachmentsService.remove(id)
	}
}
