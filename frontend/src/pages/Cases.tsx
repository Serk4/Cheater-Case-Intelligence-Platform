import { useEffect, useState } from 'react'
import {
	Typography,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Button,
	TextField,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface Case {
	id: string
	status: string
	createdAt: string
}

export default function Cases() {
	const [cases, setCases] = useState<Case[]>([])
	const [noteText, setNoteText] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		fetch('http://localhost:3000/cases')
			.then((res) => res.json())
			.then((data) => setCases(data))
			.catch((err) => console.error(err))
	}, [])

	return (
		<>
			<Typography variant='h5' gutterBottom>
				Cases
			</Typography>

			<Paper sx={{ width: '100%', overflow: 'hidden' }}>
				<TextField
					label='New Note'
					value={noteText}
					onChange={(e) => setNoteText(e.target.value)}
					fullWidth
					multiline
					sx={{ mb: 2 }}
				/>

				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Case ID</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Created</TableCell>
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
								<TableCell>{c.id}</TableCell>
								<TableCell>{c.status}</TableCell>
								<TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
								<Button
									variant='contained'
									onClick={() => {
										fetch(`http://localhost:3000/cases/${c.id}/notes`, {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
											},
											body: JSON.stringify({
												body: noteText,
												visibility: 'INTERNAL',
											}),
										})
											.then(() => setNoteText('')) // clear input
											.catch(console.error)
									}}
								>
									Add Note
								</Button>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</>
	)
}
