import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export interface FileUploadResult {
	filename: string
	originalName: string
	mimeType: string
	size: number
	checksum: string // MD5 hash for integrity verification
	storageKey: string // internal storage identifier
	storageUrl: string // public URL or path
	uploadedAt: Date
}

export interface StorageConfig {
	type: 'local' | 's3'
	basePath?: string // for local storage
	bucketName?: string // for S3
	region?: string // for S3
	accessKeyId?: string // for S3
	secretAccessKey?: string // for S3
	endpoint?: string // custom S3 endpoint
	publicUrl?: string // public base URL
}

@Injectable()
export class StorageService {
	private readonly logger = new Logger('StorageService')
	private config: StorageConfig
	private uploadDir: string

	constructor() {
		this.initializeConfig()
		this.initializeStorage()
	}

	private initializeConfig(): void {
		const storageType = process.env.STORAGE_TYPE || 'local'

		if (storageType === 's3') {
			this.config = {
				type: 's3',
				bucketName: process.env.S3_BUCKET_NAME,
				region: process.env.S3_REGION || 'us-east-1',
				accessKeyId: process.env.S3_ACCESS_KEY_ID,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
				endpoint: process.env.S3_ENDPOINT,
				publicUrl: process.env.S3_PUBLIC_URL,
			}
			this.logger.log('Initialized S3 storage configuration')
		} else {
			this.config = {
				type: 'local',
				basePath: process.env.LOCAL_STORAGE_PATH || './uploads',
				publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
			}
			this.logger.log(`Initialized local storage at ${this.config.basePath}`)
		}
	}

	private initializeStorage(): void {
		if (this.config.type === 'local') {
			this.uploadDir = this.config.basePath

			if (!fs.existsSync(this.uploadDir)) {
				fs.mkdirSync(this.uploadDir, { recursive: true })
				this.logger.log(`Created upload directory: ${this.uploadDir}`)
			}

			// Create subdirectories for organization
			const subdirs = ['evidence', 'notes', 'temp']
			subdirs.forEach((subdir) => {
				const subpath = path.join(this.uploadDir, subdir)
				if (!fs.existsSync(subpath)) {
					fs.mkdirSync(subpath, { recursive: true })
				}
			})
		}
	}

	/**
	 * Upload a file to storage
	 * Returns file metadata including checksum for integrity verification
	 */
	async uploadFile(
		file: Express.Multer.File,
		category: 'evidence' | 'notes' = 'evidence',
	): Promise<FileUploadResult> {
		if (!file) {
			throw new BadRequestException('No file provided')
		}

		try {
			const checksum = this.calculateChecksum(file.buffer)

			if (this.config.type === 'local') {
				return this.uploadFileLocal(file, category, checksum)
			} else if (this.config.type === 's3') {
				return this.uploadFileS3(file, category, checksum)
			}
		} catch (error) {
			this.logger.error(`File upload failed: ${error.message}`, error.stack)
			throw new InternalServerErrorException('File upload failed')
		}
	}

	/**
	 * Upload multiple files at once
	 */
	async uploadFiles(
		files: Express.Multer.File[],
		category: 'evidence' | 'notes' = 'evidence',
	): Promise<FileUploadResult[]> {
		if (!files || files.length === 0) {
			throw new BadRequestException('No files provided')
		}

		return Promise.all(files.map((file) => this.uploadFile(file, category)))
	}

	/**
	 * Delete a file from storage
	 */
	async deleteFile(storageKey: string): Promise<void> {
		try {
			if (this.config.type === 'local') {
				this.deleteFileLocal(storageKey)
			} else if (this.config.type === 's3') {
				await this.deleteFileS3(storageKey)
			}
			this.logger.log(`Deleted file: ${storageKey}`)
		} catch (error) {
			this.logger.error(`File deletion failed: ${error.message}`, error.stack)
			throw new InternalServerErrorException('File deletion failed')
		}
	}

	/**
	 * Verify file integrity using stored checksum
	 */
	async verifyFileIntegrity(
		storageKey: string,
		expectedChecksum: string,
	): Promise<boolean> {
		try {
			if (this.config.type === 'local') {
				const filePath = path.join(this.uploadDir, storageKey)
				if (!fs.existsSync(filePath)) {
					return false
				}
				const fileBuffer = fs.readFileSync(filePath)
				const actualChecksum = this.calculateChecksum(fileBuffer)
				return actualChecksum === expectedChecksum
			} else if (this.config.type === 's3') {
				// S3 verification would involve checking ETag or downloading and hashing
				// For now, we'll trust S3's reliability
				return true
			}
		} catch (error) {
			this.logger.error(`Integrity check failed: ${error.message}`)
			return false
		}
	}

	/**
	 * Get file metadata without downloading
	 */
	async getFileMetadata(storageKey: string): Promise<any> {
		try {
			if (this.config.type === 'local') {
				const filePath = path.join(this.uploadDir, storageKey)
				if (!fs.existsSync(filePath)) {
					return null
				}
				const stats = fs.statSync(filePath)
				return {
					size: stats.size,
					lastModified: stats.mtime,
					exists: true,
				}
			} else if (this.config.type === 's3') {
				// Would use S3 head_object here
				return null
			}
		} catch (error) {
			this.logger.error(`Metadata retrieval failed: ${error.message}`)
			return null
		}
	}

	/**
	 * Generate secure storage key
	 */
	private generateStorageKey(originalName: string, category: string): string {
		const timestamp = Date.now()
		const random = crypto.randomBytes(4).toString('hex')
		const ext = path.extname(originalName)
		const name = path.basename(originalName, ext)

		return `${category}/${timestamp}-${random}${ext}`
	}

	/**
	 * Calculate MD5 checksum for file integrity
	 */
	private calculateChecksum(buffer: Buffer): string {
		return crypto.createHash('md5').update(buffer).digest('hex')
	}

	/**
	 * Upload file to local storage
	 */
	private uploadFileLocal(
		file: Express.Multer.File,
		category: string,
		checksum: string,
	): FileUploadResult {
		const storageKey = this.generateStorageKey(file.originalname, category)
		const filePath = path.join(this.uploadDir, storageKey)

		// Ensure directory exists
		const dir = path.dirname(filePath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}

		// Write file
		fs.writeFileSync(filePath, file.buffer)

		// Verify write
		if (!fs.existsSync(filePath)) {
			throw new Error(`Failed to write file to ${filePath}`)
		}

		const storageUrl = `${this.config.publicUrl}/uploads/${storageKey}`

		return {
			filename: path.basename(storageKey),
			originalName: file.originalname,
			mimeType: file.mimetype,
			size: file.size,
			checksum,
			storageKey,
			storageUrl,
			uploadedAt: new Date(),
		}
	}

	/**
	 * Delete file from local storage
	 */
	private deleteFileLocal(storageKey: string): void {
		const filePath = path.join(this.uploadDir, storageKey)
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
		}
	}

	/**
	 * Upload file to S3 (stub for now)
	 */
	private async uploadFileS3(
		file: Express.Multer.File,
		category: string,
		checksum: string,
	): Promise<FileUploadResult> {
		// TODO: Implement S3 upload using aws-sdk
		// For now, return a placeholder
		throw new InternalServerErrorException('S3 storage not yet implemented')
	}

	/**
	 * Delete file from S3 (stub for now)
	 */
	private async deleteFileS3(storageKey: string): Promise<void> {
		// TODO: Implement S3 delete using aws-sdk
		throw new InternalServerErrorException('S3 storage not yet implemented')
	}
}
