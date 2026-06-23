import { useState } from 'react'
import {
	Box,
	Typography,
	TextField,
	Select,
	MenuItem,
	Button,
} from '@mui/material'
import { apiClient } from '../api/client'

interface EvidenceUploaderProps {
	caseId: string
	onSuccess?: () => void
}

export default function EvidenceUploader({
	caseId,
	onSuccess,
}: EvidenceUploaderProps) {
	const [uploading, setUploading] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [evidenceType, setEvidenceType] = useState('SCREENSHOT')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const target = e.target as typeof e.target & {
			file: { files: FileList }
		}
		const file = target.file.files[0]
		if (!file || !title) return alert('File and title required')

		setUploading(true)

		const formData = new FormData()
		formData.append('file', file)
		formData.append('title', title)
		formData.append('description', description)
		formData.append('evidenceType', evidenceType)
		formData.append('uploadedById', 'cmqhc0zF000pu0d84hsovsc0')

		try {
			await apiClient.uploadEvidence(caseId, formData)
			setTitle('')
			setDescription('')
			onSuccess?.()
		} finally {
			setUploading(false)
		}
	}

	return (
		<Box
			sx={{
				mt: 4,
				p: 3,
				border: '1px solid #333',
				borderRadius: 2,
				backgroundColor: '#1a1f2e',
			}}
		>
			<Typography variant='h6' gutterBottom>
				Upload Evidence
			</Typography>

			<form
				onSubmit={handleSubmit}
				style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
			>
				<TextField
					label='Title'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					fullWidth
					InputProps={{ style: { color: '#fff' } }}
					InputLabelProps={{ style: { color: '#aaa' } }}
				/>

				<TextField
					label='Description'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					multiline
					minRows={3}
					fullWidth
					InputProps={{ style: { color: '#fff' } }}
					InputLabelProps={{ style: { color: '#aaa' } }}
				/>

				<Select
					value={evidenceType}
					onChange={(e) => setEvidenceType(e.target.value)}
					fullWidth
					sx={{ color: '#fff', borderColor: '#444' }}
				>
					<MenuItem value='SCREENSHOT'>Screenshot</MenuItem>
					<MenuItem value='VIDEO'>Video</MenuItem>
					<MenuItem value='REPLAY'>Replay</MenuItem>
					<MenuItem value='LOG'>Log File</MenuItem>
					<MenuItem value='OTHER'>Other</MenuItem>
				</Select>

				<label htmlFor='evidence-file'>Upload File</label>
				<input
					type='file'
					id='evidence-file'
					name='file'
					accept='image/*,video/*'
					required
					aria-label='Evidence file upload'
				/>

				<Button variant='contained' type='submit' disabled={uploading}>
					{uploading ? 'Uploading...' : 'Upload Evidence'}
				</Button>
			</form>
		</Box>
	)
}
