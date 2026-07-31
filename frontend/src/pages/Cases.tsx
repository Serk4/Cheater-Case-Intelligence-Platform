import { useQuery } from '@tanstack/react-query'
import {
	Typography,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Box,
	Button,
	CircularProgress,
	Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { renderCaseStatus, renderCasePriority } from '../utils/enums'
import { apiClient } from '../api/client'
import type { CaseSummary } from '../api/types/case'
import { useAuth } from '../auth/AuthContext'

export default function Cases() {
	const navigate = useNavigate()
	const { hasRole } = useAuth()

	const { data: cases = [], isLoading, error } = useQuery<CaseSummary[]>({
		queryKey: ['cases'],
		queryFn: () => apiClient.cases.list(),
	})

	if (isLoading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>
	if (error) return <Alert severity="error">Failed to load cases.</Alert>

	return (
		<>
			<Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
				<Typography variant='h5'>Cases</Typography>
				{hasRole('ANALYST', 'SENIOR_ANALYST', 'ADMIN') && (
					<Button variant='contained' onClick={() => navigate('/cases/new')}>
						New Case
					</Button>
				)}
			</Box>
			<Paper sx={{ width: '100%', overflow: 'hidden' }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Case</TableCell>
							<TableCell>Priority</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Created</TableCell>
							<TableCell />
						</TableRow>
					</TableHead>

					<TableBody>
						{cases.map((c) => (
							<TableRow
								key={c.id}
								hover
								sx={{ cursor: 'pointer' }}
								onClick={() => navigate(`/cases/${c.id}`)}
							>
								<TableCell>
									<Typography fontWeight='bold'>{c.caseNumber}</Typography>
									{c.title && (
										<Typography variant='caption' color='text.secondary'>{c.title}</Typography>
									)}
								</TableCell>

								<TableCell>{renderCasePriority(c.priority)}</TableCell>
								<TableCell>{renderCaseStatus(c.status)}</TableCell>
								<TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>

								<TableCell align='right'>
									<ChevronRightIcon color='action' />
								</TableCell>
							</TableRow>
						))}
						{cases.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
									No cases found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Paper>
		</>
	)
}
