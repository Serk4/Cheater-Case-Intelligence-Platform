import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Box,
	Typography,
	Chip,
	CircularProgress,
	Dialog,
	List,
	ListItem,
	ListItemText,
	Paper,
	Alert,
	Button,
	LinearProgress,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { Drawer } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PsychologyIcon from '@mui/icons-material/Psychology'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import EvidenceUploader from '../components/EvidenceUploader'
import { CaseData, Evidence, Attachment } from '../api/types/case'
import NotesPanel from '../components/NotesPanel'
import EvidenceNotesPanel from '../components/EvidenceNotesPanel'
import { renderCaseStatus, renderCasePriority } from '../utils/enums'
import { apiClient } from '../api/client'
import { useAuth } from '../auth/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// ----------------------
// Helpers
// ----------------------
function getAttachmentType(filename?: string) {
	if (!filename) return 'other'
	const ext = filename.toLowerCase()
	if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.gif')) return 'image'
	if (ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.mov')) return 'video'
	if (ext.endsWith('.txt') || ext.endsWith('.log')) return 'text'
	return 'other'
}

function getAttachmentIcon(type: string) {
	switch (type) {
		case 'image': return <ImageIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		case 'video': return <MovieIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		case 'text': return <DescriptionIcon sx={{ fontSize: 32, color: '#90caf9' }} />
		default: return <InsertDriveFileIcon sx={{ fontSize: 32, color: '#90caf9' }} />
	}
}

// ----------------------
// AI Panel component
// ----------------------
function AiPanel({ caseId, analysis, onRefresh }: {
	caseId: string
	analysis: CaseData['aiAnalysis']
	onRefresh: () => void
}) {
	const { hasRole } = useAuth()
	const queryClient = useQueryClient()

	const { data: config } = useQuery({
		queryKey: ['ai-config'],
		queryFn: () => apiClient.ai.getConfig(),
		staleTime: 60_000,
	})

	const { mutate: runAnalysis, isPending: analyzing } = useMutation({
		mutationFn: () => apiClient.ai.analyzeCase(caseId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['case', caseId] })
			onRefresh()
		},
	})

	const { mutate: submitFeedback, isPending: submittingFeedback } = useMutation({
		mutationFn: ({
			decision,
			note,
		}: {
			decision: 'ACCEPTED' | 'MODIFIED' | 'REJECTED'
			note?: string
		}) =>
			apiClient.ai.submitFeedback(caseId, analysis!.id, decision, note),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['case', caseId] })
			onRefresh()
		},
	})

	if (!config?.aiEnabled && !analysis) return null

	return (
		<Paper sx={{ p: 2, mt: 3, border: '1px solid #1e3a5f', bgcolor: '#0d1b2a' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
				<PsychologyIcon sx={{ color: '#90caf9' }} />
				<Typography variant="h6" sx={{ color: '#90caf9' }}>
					AI Triage
				</Typography>
				{config?.aiEnabled && hasRole('ANALYST', 'SENIOR_ANALYST', 'ADMIN') && (
					<Button
						size="small"
						variant="outlined"
						sx={{ ml: 'auto' }}
						onClick={() => runAnalysis()}
						disabled={analyzing}
					>
						{analyzing ? <CircularProgress size={16} /> : analysis ? 'Re-analyze' : 'Analyze'}
					</Button>
				)}
				{!config?.aiEnabled && (
					<Chip
						label="AI disabled"
						size="small"
						sx={{ ml: 'auto', opacity: 0.6 }}
					/>
				)}
			</Box>

			{analysis ? (
				<>
					{/* Confidence bar */}
					<Box sx={{ mb: 2 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
							<Typography variant="caption" color="text.secondary">
								Confidence
							</Typography>
							<Typography variant="caption" fontWeight="bold">
								{Math.round(analysis.confidence * 100)}%
							</Typography>
						</Box>
						<LinearProgress
							variant="determinate"
							value={analysis.confidence * 100}
							color={
								analysis.confidence >= 0.7
									? 'error'
									: analysis.confidence >= 0.4
									? 'warning'
									: 'primary'
							}
							sx={{ height: 8, borderRadius: 4 }}
						/>
					</Box>

					{/* Summary */}
					<Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
						{analysis.summary}
					</Typography>

					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
						{analysis.suggestedViolationType && (
							<Chip
								label={`Violation: ${analysis.suggestedViolationType}`}
								size="small"
								color="warning"
								variant="outlined"
							/>
						)}
						{analysis.suggestedPriority && (
							<Chip
								label={`Priority: ${analysis.suggestedPriority}`}
								size="small"
								variant="outlined"
							/>
						)}
					</Box>

					<Typography variant="caption" color="text.disabled">
						Analyzed {new Date(analysis.createdAt).toLocaleString()}
					</Typography>

					{/* Reviewer feedback */}
					{analysis.reviewerDecision ? (
						<Box sx={{ mt: 1.5 }}>
							<Chip
								icon={
									analysis.reviewerDecision === 'REJECTED' ? (
										<CancelIcon />
									) : (
										<CheckCircleIcon />
									)
								}
								label={`Reviewer: ${analysis.reviewerDecision}`}
								size="small"
								color={
									analysis.reviewerDecision === 'ACCEPTED'
										? 'success'
										: analysis.reviewerDecision === 'REJECTED'
										? 'error'
										: 'warning'
								}
							/>
							{analysis.reviewerNote && (
								<Typography variant="caption" sx={{ ml: 1 }}>
									{analysis.reviewerNote}
								</Typography>
							)}
						</Box>
					) : (
						hasRole('ANALYST', 'SENIOR_ANALYST', 'ADMIN') && (
							<Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
								<Button
									size="small"
									variant="contained"
									color="success"
									startIcon={<CheckCircleIcon />}
									disabled={submittingFeedback}
									onClick={() => submitFeedback({ decision: 'ACCEPTED' })}
								>
									Accept
								</Button>
								<Button
									size="small"
									variant="outlined"
									color="warning"
									startIcon={<EditIcon />}
									disabled={submittingFeedback}
									onClick={() => submitFeedback({ decision: 'MODIFIED' })}
								>
									Modified
								</Button>
								<Button
									size="small"
									variant="outlined"
									color="error"
									startIcon={<CancelIcon />}
									disabled={submittingFeedback}
									onClick={() => submitFeedback({ decision: 'REJECTED' })}
								>
									Reject
								</Button>
							</Box>
						)
					)}
				</>
			) : (
				<Typography variant="body2" color="text.secondary">
					{config?.aiEnabled
						? 'No analysis yet. Click Analyze to run AI triage.'
						: 'Enable AI_ENABLED and provide OPENAI_API_KEY to use automated triage.'}
				</Typography>
			)}
		</Paper>
	)
}

// ----------------------
// Main CaseView component
// ----------------------
export default function CaseView() {
	const { id } = useParams<{ id: string }>()
	const queryClient = useQueryClient()

	const {
		data: caseData,
		isLoading,
		error,
		refetch,
	} = useQuery<CaseData>({
		queryKey: ['case', id],
		queryFn: () => apiClient.cases.get(id!),
		enabled: !!id,
	})

	const [viewerOpen, setViewerOpen] = useState(false)
	type ViewerContent =
		| { type: 'image' | 'video' | 'pdf'; url: string }
		| { type: 'text'; text: string }

	const [viewerContent, setViewerContent] = useState<ViewerContent | null>(null)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
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
		if (next < caseData.evidence.length) openEvidenceDrawerAtIndex(next)
	}

	function goPrevEvidence() {
		if (evidenceIndex === null || !caseData?.evidence) return
		const prev = evidenceIndex - 1
		if (prev >= 0) openEvidenceDrawerAtIndex(prev)
	}

	function openAttachment(att: Attachment) {
		const mime = att.mimeType
		const url = att.storageUrl.startsWith('http')
			? att.storageUrl
			: `${API_BASE}${att.storageUrl}`

		if (mime.startsWith('image/')) { setViewerContent({ type: 'image', url }); setViewerOpen(true); return }
		if (mime.startsWith('video/')) { setViewerContent({ type: 'video', url }); setViewerOpen(true); return }
		if (mime === 'application/pdf') { setViewerContent({ type: 'pdf', url }); setViewerOpen(true); return }
		if (mime.startsWith('text/')) {
			fetch(url).then((r) => r.text()).then((text) => { setViewerContent({ type: 'text', text }); setViewerOpen(true) }).catch(() => window.open(url, '_blank'))
			return
		}
		window.open(url, '_blank')
	}

	// Keyboard navigation for the evidence drawer
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (!drawerOpen) return
			if (e.key === 'ArrowRight') goNextEvidence()
			if (e.key === 'ArrowLeft') goPrevEvidence()
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [drawerOpen, evidenceIndex, caseData])

	if (isLoading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>
	if (error || !caseData) return <Box sx={{ p: 3 }}><Alert severity="error">Could not load case.</Alert></Box>

	return (
		<Box sx={{ p: 3 }}>
			{/* ── Header ── */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" gutterBottom>
					{caseData.caseNumber}
				</Typography>
				{caseData.title && (
					<Typography variant="h6" color="text.secondary" gutterBottom>
						{caseData.title}
					</Typography>
				)}
				<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
					{renderCaseStatus(caseData.status)}
					{renderCasePriority(caseData.priority)}
					{caseData.game && <Chip label={caseData.game.name} size="small" variant="outlined" />}
				</Box>
				<Typography variant="body2" color="text.secondary">
					Opened: {new Date(caseData.createdAt).toLocaleString()}
					{caseData.openedBy && ` by ${caseData.openedBy.displayName}`}
					{caseData.assignedTo && ` · Assigned to ${caseData.assignedTo.displayName}`}
				</Typography>
				{caseData.description && (
					<Typography variant="body2" sx={{ mt: 1 }}>{caseData.description}</Typography>
				)}
			</Box>

			{/* ── AI Panel ── */}
			<AiPanel
				caseId={caseData.id}
				analysis={caseData.aiAnalysis ?? null}
				onRefresh={() => queryClient.invalidateQueries({ queryKey: ['case', id] })}
			/>

			{/* ── Subjects ── */}
			{caseData.subjects && caseData.subjects.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Typography variant="h6" gutterBottom>Subjects</Typography>
					<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
						{caseData.subjects.map((s) => (
							<Paper key={s.id} sx={{ p: 1.5, minWidth: 160 }}>
								<Typography fontWeight="bold">{s.displayName ?? s.gameAccountId}</Typography>
								{s.platform && (
									<Typography variant="caption" color="text.secondary">
										{s.platform.name}
									</Typography>
								)}
							</Paper>
						))}
					</Box>
				</Box>
			)}

			{/* ── Violation Types ── */}
			{caseData.violationTypes && caseData.violationTypes.length > 0 && (
				<Box sx={{ mt: 2 }}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Violation Types
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						{caseData.violationTypes.map((v) => (
							<Chip key={v.id} label={v.name} size="small" color="warning" />
						))}
					</Box>
				</Box>
			)}

			{/* ── Verdict ── */}
			{caseData.verdict && (
				<Paper sx={{ p: 2, mt: 3, border: '1px solid #2e7d32', bgcolor: '#0a1f0a' }}>
					<Typography variant="h6" gutterBottom sx={{ color: '#66bb6a' }}>
						Verdict
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
						{caseData.verdict.sanctionTemplate && (
							<Chip label={caseData.verdict.sanctionTemplate.name} color="error" size="small" />
						)}
					</Box>
					<Typography variant="body2">{caseData.verdict.reasoning ?? caseData.verdict.decision}</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
						Rendered by {caseData.verdict.renderedBy?.displayName ?? 'Unknown'} on{' '}
						{new Date(caseData.verdict.createdAt).toLocaleString()}
					</Typography>
				</Paper>
			)}

			{/* ── Evidence ── */}
			<Box sx={{ mt: 4 }}>
				<Typography variant="h6" gutterBottom>Evidence</Typography>

				{caseData.evidence && caseData.evidence.length > 0 ? (
					caseData.evidence.map((ev, index) => (
						<Box
							key={ev.id}
							sx={{
								mb: 2, p: 2,
								border: evidenceIndex === index ? '2px solid #90caf9' : '1px solid #333',
								borderRadius: 1, cursor: 'pointer',
								backgroundColor: evidenceIndex === index ? '#1a1f2e' : 'transparent',
								'&:hover': { backgroundColor: '#1a1f2e', borderColor: '#90caf9' },
							}}
							onClick={() => openEvidenceDrawerAtIndex(index)}
						>
							<Typography variant="subtitle1">{ev.type}</Typography>
							<Typography variant="body2" color="text.secondary">
								Uploaded: {new Date(ev.createdAt).toLocaleString()}
								{ev.uploadedBy && ` by ${ev.uploadedBy.displayName}`}
							</Typography>
							{ev.attachments?.map((att) => (
								<Box key={att.id} sx={{ mt: 1 }}>
									<Box
										onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); openAttachment(att) }}
										sx={{ display: 'inline-block', cursor: 'pointer' }}
									>
										<Typography sx={{ color: '#90caf9' }}>
											📎 {att.fileName ?? 'Unnamed Attachment'}
										</Typography>
									</Box>
								</Box>
							))}
						</Box>
					))
				) : (
					<Typography color="text.secondary">No evidence uploaded yet.</Typography>
				)}

				<Box sx={{ mt: 4, p: 3, border: '1px solid #333', borderRadius: 2, backgroundColor: '#1a1f2e' }}>
					<EvidenceUploader caseId={caseData.id} onSuccess={() => refetch()} />
				</Box>
			</Box>

			{/* ── Reports ── */}
			<Box sx={{ mt: 4 }}>
				<Typography variant="h6" gutterBottom>Reports</Typography>
				{caseData.reports && caseData.reports.length > 0 ? (
					caseData.reports.map((rep) => (
						<Box key={rep.id} sx={{ mb: 2, p: 2, border: '1px solid #333', borderRadius: 1 }}>
							<Typography variant="subtitle1">
								Report by {rep.reportedBy?.displayName ?? 'Unknown'}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{new Date(rep.createdAt).toLocaleString()}
							</Typography>
							<Typography sx={{ mt: 1 }}>{rep.summary ?? rep.description ?? rep.detail}</Typography>
							{rep.detail && rep.summary && (
								<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
									{rep.detail}
								</Typography>
							)}
						</Box>
					))
				) : (
					<Typography color="text.secondary">No reports submitted.</Typography>
				)}
			</Box>

			{/* ── Notes Panel ── */}
			<NotesPanel caseId={caseData.id} />

			{/* ── Attachment Viewer Modal ── */}
			<Dialog open={viewerOpen} onClose={() => { setViewerOpen(false); setViewerContent(null) }} maxWidth="lg" fullWidth>
				<Box sx={{ p: 2 }}>
					{viewerContent?.type === 'image' && <img src={viewerContent.url} alt="Evidence" style={{ width: '100%' }} />}
					{viewerContent?.type === 'video' && <video src={viewerContent.url} controls style={{ width: '100%' }} />}
					{viewerContent?.type === 'text' && (
						<Box sx={{ whiteSpace: 'pre-wrap', color: 'white', backgroundColor: '#111', padding: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem', height: '70vh', overflowY: 'auto' }}>
							{viewerContent.text}
						</Box>
					)}
					{viewerContent?.type === 'pdf' && (
						<iframe title="PDF Viewer" src={viewerContent.url} style={{ width: '100%', height: '70vh', background: '#111' }} />
					)}

					{selectedEvidence?.attachments && selectedEvidence.attachments.length > 0 && (
						<Box sx={{ mt: 3 }}>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments</Typography>
							<List dense>
								{selectedEvidence.attachments.map((att) => (
									<ListItem key={att.id} onClick={() => openAttachment(att)} sx={{ cursor: 'pointer' }}>
										<ListItemText primary={att.fileName} secondary={att.mimeType} />
									</ListItem>
								))}
							</List>
						</Box>
					)}
				</Box>
			</Dialog>

			{/* ── Evidence Drawer ── */}
			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => { setDrawerOpen(false); setSelectedEvidence(null); setEvidenceIndex(null) }}
				PaperProps={{ sx: { width: 420, background: '#111', color: '#fff', p: 2, display: 'flex', flexDirection: 'column' } }}
			>
				<Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
					{selectedEvidence && (
						<>
							<Typography variant="h6" sx={{ mb: 1 }}>{selectedEvidence.type}</Typography>
							<Typography variant="body2" color="text.secondary">
								Uploaded: {new Date(selectedEvidence.createdAt).toLocaleString()}
							</Typography>

							<Box sx={{ mt: 3 }}>
								<Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments</Typography>
								{selectedEvidence.attachments?.map((att) => {
									const type = getAttachmentType(att.fileName)
									const fullUrl = att.storageUrl.startsWith('http') ? att.storageUrl : `${API_BASE}${att.storageUrl}`
									return (
										<Box key={att.id} sx={{ mt: 2, p: 1.5, border: '1px solid #333', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
											onClick={() => openAttachment(att)}
										>
											{type === 'image' ? (
												<Box component="img" src={fullUrl} sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, border: '1px solid #444' }} />
											) : (
												getAttachmentIcon(type)
											)}
											<Box>
												<Typography sx={{ fontWeight: 600 }}>{att.fileName}</Typography>
												<Typography variant="body2" color="text.secondary">{att.mimeType}</Typography>
												<Typography variant="body2" color="text.secondary">{(att.sizeBytes / 1024).toFixed(1)} KB</Typography>
											</Box>
										</Box>
									)
								})}
							</Box>
						</>
					)}
					{selectedEvidence?.id && (
						<EvidenceNotesPanel caseId={id} evidenceId={selectedEvidence.id} />
					)}
				</Box>
			</Drawer>
		</Box>
	)
}

// ----------------------
// Helpers
// ----------------------