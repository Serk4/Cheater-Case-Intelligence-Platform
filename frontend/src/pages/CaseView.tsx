import { useEffect, useState } from 'react'
import { Box, Typography, Chip, CircularProgress, Dialog } from '@mui/material'
import { useParams } from 'react-router-dom'
import { Drawer } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

// ----------------------
// Types
// ----------------------
interface Attachment {
	id: string
	fileName: string
	mimeType: string
	sizeBytes: number
	storageUrl: string
	createdAt: string
}

interface Evidence {
	id: string
	type: string
	description?: string | null
	createdAt: string
	attachments?: Attachment[]
}

interface Report {
	id: string
	description: string
	createdAt: string
	reportedBy?: {
		id: string
		displayName: string | null
	} | null
}

interface CaseData {
	id: string
	caseNumber: string
	title: string | null
	description: string | null
	status: string
	priority: string
	createdAt: string

	reports?: Report[]
	evidence?: Evidence[]
}

// ==================== EVIDENCE UPLOADER ====================
function EvidenceUploader({ caseId, onSuccess }: { caseId: string; onSuccess?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState<'SCREENSHOT' | 'VIDEO' | 'REPLAY' | 'LOG' | 'OTHER'>('SCREENSHOT');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fileInput = (e.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file || !title) {
      alert('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('evidenceType', evidenceType);
    formData.append('uploadedById', 'cmqmhc0yb0003u0d8d51lvcis'); // ← ToDO: replace with actual logged-in user ID
    formData.append('caseId', caseId);

    try {
      const res = await fetch(`http://localhost:3000/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Upload error:', responseData);
        alert(`Upload failed: ${responseData.message || responseData.error || 'Unknown error'}`);
        return;
      }

      alert('✅ Evidence uploaded successfully!');
      setTitle('');
      setDescription('');
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      alert(`Network error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

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
				Upload New Evidence
			</Typography>

			<form
				onSubmit={handleSubmit}
				style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
			>
				<input
					type='text'
					placeholder='Evidence Title (required)'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					style={{
						padding: 12,
						background: '#111',
						color: '#fff',
						border: '1px solid #444',
						borderRadius: 4,
					}}
					required
				/>

				<textarea
					placeholder='Description (optional)'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					style={{
						padding: 12,
						background: '#111',
						color: '#fff',
						border: '1px solid #444',
						borderRadius: 4,
						minHeight: 80,
					}}
				/>

				<select
					title='Evidence Type'
					value={evidenceType}
					onChange={(e) => setEvidenceType(e.target.value as any)}
					style={{
						padding: 12,
						background: '#111',
						color: '#fff',
						border: '1px solid #444',
						borderRadius: 4,
					}}
				>
					<option value='SCREENSHOT'>Screenshot</option>
					<option value='VIDEO'>Video</option>
					<option value='REPLAY'>Replay File</option>
					<option value='LOG'>Log File</option>
					<option value='OTHER'>Other</option>
				</select>

				<input title='Evidence File' type='file' name='file' accept='image/*,video/*,.dem,.log' />

				<button
          title='Upload Evidence'
					type='submit'
					disabled={uploading}
					style={{
						padding: '12px 24px',
						background: '#1976d2',
						color: 'white',
						border: 'none',
						borderRadius: 4,
						cursor: uploading ? 'not-allowed' : 'pointer',
					}}
				>
					{uploading ? 'Uploading...' : 'Upload Evidence'}
				</button>
			</form>
		</Box>
	)
}

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
	const [viewerContent, setViewerContent] = useState<{
		type: string
		url: string
	} | null>(null)

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

	function openViewer(type: string, url: string) {
		setViewerContent({ type, url })
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
  <Typography variant="h6" gutterBottom>
    Evidence
  </Typography>

  {caseData.evidence && caseData.evidence.length > 0 ? (
    caseData.evidence.map((ev, index) => (
      <Box
        key={ev.id}
        sx={{
          mb: 2,
          p: 2,
          border: evidenceIndex === index ? '2px solid #90caf9' : '1px solid #333',
          borderRadius: 1,
          cursor: 'pointer',
          backgroundColor: evidenceIndex === index ? '#1a1f2e' : 'transparent',
          '&:hover': {
            backgroundColor: '#1a1f2e',
            borderColor: '#90caf9',
          },
        }}
        onClick={() => openEvidenceDrawerAtIndex(index)}
      >
        <Typography variant="subtitle1">{ev.type}</Typography>
        <Typography variant="body2" color="text.secondary">
          Uploaded: {new Date(ev.createdAt).toLocaleString()}
        </Typography>

        {ev.attachments?.map((att) => {
          const type = getAttachmentType(att.fileName);
          const fullUrl = `http://localhost:3000${att.storageUrl}`;

          return (
            <Box key={att.id} sx={{ mt: 1 }}>
              <Typography
                sx={{ color: '#90caf9', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  openViewer(type, fullUrl);   // Enable preview
                }}
              >
                📎 {att.fileName ?? 'Unnamed Attachment'}
              </Typography>
            </Box>
          );
        })}
      </Box>
    ))
  ) : (
    <Typography color="text.secondary">No evidence uploaded yet.</Typography>
  )}

  {/* Evidence Upload Form */}
  <EvidenceUploader 
    caseId={caseData.id} 
    onSuccess={() => window.location.reload()} 
  />
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
					{viewerContent?.type === 'image' && (
						<img src={viewerContent.url} style={{ width: '100%' }} />
					)}

					{viewerContent?.type === 'video' && (
						<video src={viewerContent.url} controls style={{ width: '100%' }} />
					)}

					{viewerContent?.type === 'text' && (
						<iframe
							src={viewerContent.url}
							style={{
								width: '100%',
								height: '70vh',
								background: '#111',
								color: '#fff',
							}}
						/>
					)}

					{viewerContent?.type === 'other' && (
						<Typography>
							Download: <a href={viewerContent.url}>{viewerContent.url}</a>
						</Typography>
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
