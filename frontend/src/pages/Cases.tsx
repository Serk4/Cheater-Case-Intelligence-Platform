import { useEffect, useState } from 'react'
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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { renderCaseStatus } from '../utils/enums'

interface Case {
	caseNumber: string
	id: string
	status: string
	createdAt: string
}

export default function Cases() {
	const [cases, setCases] = useState<Case[]>([])
	const navigate = useNavigate()
	const user = { role: 'ANALYST' } // Replace with actual user role from your auth context or state

	useEffect(() => {
		fetch('http://localhost:3000/cases')
			.then((res) => res.json())
			.then((data) => setCases(data))
			.catch((err) => console.error(err))
	}, [])

	return (
		<>
			<Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
				<Typography variant='h5'>Cases</Typography>
				{['ANALYST', 'SENIOR_ANALYST', 'ADMIN'].includes(user.role) && (
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
							<TableCell>Status</TableCell>
							<TableCell>Created</TableCell>
							<TableCell /> {/* Chevron column */}
						</TableRow>
					</TableHead>

					<TableBody>
						{cases.map((c) => (
							<TableRow
								key={c.id}
								hover
								sx={{ cursor: 'pointer' }}
								title='View Case'
								onClick={() => navigate(`/cases/${c.id}`)}
							>
								<TableCell>
									<Typography fontWeight='bold'>{c.caseNumber}</Typography>
								</TableCell>

								<TableCell>{renderCaseStatus(c.status)}</TableCell>

								<TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>

								<TableCell align='right'>
									<ChevronRightIcon color='action' />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</>
	)
}
