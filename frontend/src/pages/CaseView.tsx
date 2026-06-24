import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Chip,
	CircularProgress,
	Dialog,
	List,
	ListItem,
	ListItemText,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { Drawer } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import EvidenceUploader from '../components/EvidenceUploader'
import { CaseData, Evidence, Report, Attachment } from '../api/types/case'

// ----------------------
// Helpers
// ----------------------
function getAttachmentType(filename?: string) {
	if (!filename) return 'other'

	const ext = filename.toLowerCase()

	if (
		ext.endsWith('.png') ||
		ext.endsWith('.jpg') ||
		ext.endsWith('.jpeg') ||
		ext.endsWith('.gif')
	) {
		return 'image'
	}

	if (ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.mov')) {
		return 'video'
	}

	if (ext.endsWith('.txt') || ext.endsWith('.log')) {
		return 'text'
	}

	return 'other'
}

function getAttachmentIcon(type: string) {
	switch (type) {
		case 'image':
			return <ImageIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		case 'video':
			return <MovieIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		case 'text':
			return <DescriptionIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		default:
			return <InsertDriveFileIcon sx={{ fontSize: 32, color: '#90caf9' }} />
	}
}

// ----------------------
// Component
// ----------------------
export default function CaseView() {
	const { id } = useParams<{ id: string }>()
	const [caseData, setCaseData] = useState<CaseData | null>(null)

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [viewerOpen, setViewerOpen] = useState(false)
	type ViewerContent =
		| { type: 'image' | 'video' | 'pdf'; url: string }
		| { type: 'text'; text: string }

	const [viewerContent, setViewerContent] = useState<ViewerContent | null>(null)

	// Drawer state
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
		null,
	)

	function openEvidenceDrawer(ev: Evidence) {
		setSelectedEvidence(ev)
		setDrawerOpen(true)
	}

	function closeEvidenceDrawer() {
		setDrawerOpen(false)
		setSelectedEvidence(null)
	}

	const [evidenceIndex, setEvidenceIndex] = useState<number | null>(null)

	function openEvidenceDrawerAtIndex(index: number) {
		console.log('DRAWER OPENED')

		if (!caseData?.evidence) return
		setEvidenceIndex(index)
		setSelectedEvidence(caseData.evidence[index])
		setDrawerOpen(true)
	}

	function goNextEvidence() {
		if (evidenceIndex === null || !caseData?.evidence) return
		const next = evidenceIndex + 1
		if (next < caseData.evidence.length) {
			openEvidenceDrawerAtIndex(next)
		}
	}

	function goPrevEvidence() {
		if (evidenceIndex === null || !caseData?.evidence) return
		const prev = evidenceIndex - 1
		if (prev >= 0) {
			openEvidenceDrawerAtIndex(prev)
		}
	}

	function openAttachment(att: Attachment) {
		const mime = att.mimeType
		const url = att.storageUrl.startsWith('http')
			? att.storageUrl
			: `http://localhost:3000${att.storageUrl}`

		try {
			if (mime.startsWith('image/')) {
				setViewerContent({ type: 'image', url })
				setViewerOpen(true)
				return
			}

			if (mime.startsWith('video/')) {
				setViewerContent({ type: 'video', url })
				setViewerOpen(true)
				return
			}

			if (mime.startsWith('text/') || mime === 'text/plain') {
				fetch(url)
					.then((res) => res.text())
					.then((text) => {
						console.log('TEXT CONTENT:', text)
						setViewerContent({ type: 'text', text })
						setViewerOpen(true)
					})
					.catch(() => window.open(url, '_blank'))
				return
			}

			if (mime === 'application/pdf') {
				setViewerContent({ type: 'pdf', url })
				setViewerOpen(true)
				return
			}

			window.open(url, '_blank')
		} catch (err) {
			console.error('Attachment viewer error:', err)
			window.open(url, '_blank')
		}
	}

	function openViewer(type: string, url: string) {
		setViewerContent({ type: type as 'image' | 'video' | 'pdf', url })
		setViewerOpen(true)
	}

	function closeViewer() {
		setViewerOpen(false)
		setViewerContent(null)
	}

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (!drawerOpen) return

			if (e.key === 'ArrowRight') goNextEvidence()
			if (e.key === 'ArrowLeft') goPrevEvidence()
		}

		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [drawerOpen, evidenceIndex, caseData])

	useEffect(() => {
		if (!id) return

		fetch(`http://localhost:3000/cases/${id}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch case')
				return res.json()
			})
			.then((data) => {
				setCaseData(data)
				setLoading(false)
			})
			.catch((err) => {
				console.error(err)
				setError('Could not load case.')
				setLoading(false)
			})
	}, [id])

	const refreshCase = async () => {
		try {
			const res = await fetch(`http://localhost:3000/cases/${id}`)
			if (!res.ok) throw new Error('Failed to fetch case')
			const data = await res.json()
			setCaseData(data)
		} catch (err) {
			console.error(err)
			setError('Could not refresh case.')
		}
	}

	if (loading) {
		return (
			<Box sx={{ p: 3 }}>
				<CircularProgress />
			</Box>
		)
	}

	if (error || !caseData) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color='error'>{error ?? 'Case not found.'}</Typography>
			</Box>
		)
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant='h4' gutterBottom>
				Case #{caseData.caseNumber ?? caseData.id}
			</Typography>

			<Chip label={caseData.status} sx={{ mb: 2 }} />

			<Typography variant='body2' color='text.secondary'>
				Created: {new Date(caseData.createdAt).toLocaleString()}
			</Typography>

			{/* ==================== EVIDENCE SECTION ==================== */}
			<Box sx={{ mt: 4 }}>
				<Typography variant='h6' gutterBottom>
					Evidence
				</Typography>

				{caseData.evidence && caseData.evidence.length > 0 ? (
					caseData.evidence.map((ev, index) => (
						<Box
							key={ev.id}
							sx={{
								mb: 2,
								p: 2,
								border:
									evidenceIndex === index
										? '2px solid #90caf9'
										: '1px solid #333',
								borderRadius: 1,
								cursor: 'pointer',
								backgroundColor:
									evidenceIndex === index ? '#1a1f2e' : 'transparent',
								'&:hover': {
									backgroundColor: '#1a1f2e',
									borderColor: '#90caf9',
								},
							}}
							onClick={() => openEvidenceDrawerAtIndex(index)}
						>
							<Typography variant='subtitle1'>{ev.type}</Typography>
							<Typography variant='body2' color='text.secondary'>
								Uploaded: {new Date(ev.createdAt).toLocaleString()}
							</Typography>

							{ev.attachments?.map((att) => {
								const type = getAttachmentType(att.fileName)
								const fullUrl = `http://localhost:3000${att.storageUrl}`
								console.log('TYPE:', type, 'ATTACHMENT:', JSON.stringify(att))

								return (
									<Box key={att.id} sx={{ mt: 1 }}>
										<Box
											onClickCapture={(e) => {
												e.preventDefault()
												e.stopPropagation()
												openAttachment(att)
											}}
											sx={{ display: 'inline-block', cursor: 'pointer' }}
										>
											<Typography sx={{ color: '#90caf9' }}>
												📎 {att.fileName ?? 'Unnamed Attachment'}
											</Typography>
										</Box>
									</Box>
								)
							})}
						</Box>
					))
				) : (
					<Typography color='text.secondary'>
						No evidence uploaded yet.
					</Typography>
				)}

				{/* Evidence Upload Form */}
				<Box
					sx={{
						mt: 4,
						p: 3,
						border: '1px solid #333',
						borderRadius: 2,
						backgroundColor: '#1a1f2e',
					}}
				>
					<EvidenceUploader caseId={caseData.id} onSuccess={refreshCase} />
				</Box>
			</Box>

			{/* ---------------------- Reports ---------------------- */}
			<Box sx={{ mt: 4 }}>
				<Typography variant='h6' gutterBottom>
					Reports
				</Typography>

				{caseData.reports && caseData.reports.length > 0 ? (
					caseData.reports.map((rep) => (
						<Box
							key={rep.id}
							sx={{
								mb: 2,
								p: 2,
								border: '1px solid #333',
								borderRadius: 1,
							}}
						>
							<Typography variant='subtitle1'>
								Report by {rep.reportedBy?.displayName ?? 'Unknown'}
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								{new Date(rep.createdAt).toLocaleString()}
							</Typography>
							<Typography sx={{ mt: 1 }}>{rep.description}</Typography>
						</Box>
					))
				) : (
					<Typography color='text.secondary'>No reports submitted.</Typography>
				)}
			</Box>

			{/* ---------------------- Viewer Modal ---------------------- */}
			<Dialog open={viewerOpen} onClose={closeViewer} maxWidth='lg' fullWidth>
				<Box sx={{ p: 2 }}>
					{/* Main Evidence Viewer */}
					{/* IMAGE */}
					{viewerContent?.type === 'image' && (
						<img
							src={viewerContent.url}
							alt='Evidence image'
							style={{ width: '100%' }}
						/>
					)}

					{/* VIDEO */}
					{viewerContent?.type === 'video' && (
						<video src={viewerContent.url} controls style={{ width: '100%' }} />
					)}

					{/* TEXT */}
					{viewerContent?.type === 'text' && (
						<Box
							sx={{
								whiteSpace: 'pre-wrap',
								color: 'white !important',
								backgroundColor: '#111',
								padding: 2,
								borderRadius: 1,
								fontFamily: 'monospace',
								fontSize: '0.9rem',
								height: '70vh',
								overflowY: 'auto',
							}}
						>
							{viewerContent.text}
						</Box>
					)}

					{/* PDF */}
					{viewerContent?.type === 'pdf' && (
						<iframe
							name='pdf-viewer'
							title='PDF Viewer'
							src={viewerContent.url}
							style={{ width: '100%', height: '70vh', background: '#111' }}
						/>
					)}

					{/* Attachments Section */}
					{selectedEvidence?.attachments &&
						selectedEvidence.attachments.length > 0 && (
							<Box sx={{ mt: 3 }}>
								<Typography variant='subtitle2' sx={{ mb: 1 }}>
									Attachments
								</Typography>

								<List dense>
									{selectedEvidence.attachments.map((att) => (
										<ListItem
											key={att.id}
											button
											onClick={() => openAttachment(att)}
										>
											<ListItemText
												primary={att.fileName}
												secondary={att.mimeType}
											/>
										</ListItem>
									))}
								</List>
							</Box>
						)}
				</Box>
			</Dialog>
			<Drawer
				anchor='right'
				open={drawerOpen}
				onClose={closeEvidenceDrawer}
				PaperProps={{
					sx: {
						width: 420,
						background: '#111',
						color: '#fff',
						p: 2,
						display: 'flex',
						flexDirection: 'column',
					},
				}}
			>
				{/* Scrollable content */}
				<Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
					{/* Evidence Header */}
					{selectedEvidence && (
						<>
							<Typography variant='h6' sx={{ mb: 1 }}>
								{selectedEvidence.type}
							</Typography>

							<Typography variant='body2' color='text.secondary'>
								Uploaded:{' '}
								{new Date(selectedEvidence.createdAt).toLocaleString()}
							</Typography>

							<Box sx={{ mt: 3 }}>
								<Typography variant='subtitle2' sx={{ mb: 1 }}>
									Attachments
								</Typography>

								{selectedEvidence.attachments?.map((att) => {
									const type = getAttachmentType(att.fileName)
									const fullUrl = `http://localhost:3000${att.storageUrl}`

									return (
										<Box
											key={att.id}
											sx={{
												mt: 2,
												p: 1.5,
												border: '1px solid #333',
												borderRadius: 1,
												display: 'flex',
												alignItems: 'center',
												gap: 2,
												cursor: 'default',
											}}
											onClick={(e) => {
												e.stopPropagation() // prevent drawer close
												// viewer disabled for now
											}}
										>
											{/* Thumbnail or icon */}
											{type === 'image' ? (
												<Box
													component='img'
													src={fullUrl}
													sx={{
														width: 64,
														height: 64,
														objectFit: 'cover',
														borderRadius: 1,
														border: '1px solid #444',
													}}
												/>
											) : (
												getAttachmentIcon(type)
											)}

											{/* Metadata */}
											<Box>
												<Typography sx={{ fontWeight: 600 }}>
													{att.fileName}
												</Typography>

												<Typography variant='body2' color='text.secondary'>
													{att.mimeType}
												</Typography>

												<Typography variant='body2' color='text.secondary'>
													{(att.sizeBytes / 1024).toFixed(1)} KB
												</Typography>

												<Typography
													variant='body2'
													color='text.secondary'
													sx={{ fontSize: '0.7rem' }}
												>
													{att.storageUrl}
												</Typography>
											</Box>
										</Box>
									)
								})}
							</Box>
						</>
					)}
				</Box>
			</Drawer>
		</Box>
	)
}
