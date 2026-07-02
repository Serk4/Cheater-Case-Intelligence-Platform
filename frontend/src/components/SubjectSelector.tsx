import { useState, useEffect } from 'react'
import {
	Autocomplete,
	TextField,
	Box,
	Button,
	CircularProgress,
} from '@mui/material'

import ConfirmDialog from './ConfirmDialog'
import SubjectCreationForm from './SubjectCreationForm'

interface Subject {
	id: string
	displayName: string
	externalId?: string
	profileUrl?: string
	platformId: string
}

interface Platform {
	id: string
	name: string
}

interface Props {
	subjectId: string | null
	setSubjectId: (id: string) => void
	platformId: string | null
	platforms: Platform[]
	disabled?: boolean
}

export default function SubjectSelector({
	subjectId,
	setSubjectId,
	platformId,
	platforms,
	disabled,
}: Props) {
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
	const [search, setSearch] = useState('')
	const [subjects, setSubjects] = useState<Subject[]>([])
	const [loading, setLoading] = useState(false)

	const [inputValue, setInputValue] = useState('')

	// Validation modal
	const [validateOpen, setValidateOpen] = useState(false)
	const [isNewSubject, setIsNewSubject] = useState(false)

	// Inline creation form
	const [creating, setCreating] = useState(false)
	const [displayName, setDisplayName] = useState('')
	const [externalId, setExternalId] = useState('')
	const [profileUrl, setProfileUrl] = useState('')

	const platform = platforms.find((p) => p.id === platformId)

	// Reset inline form helper
	const resetInlineForm = () => {
		setCreating(false)
		setDisplayName('')
		setExternalId('')
		setProfileUrl('')
	}

	// Reset inline form when platform changes
	useEffect(() => {
		resetInlineForm()
		setSelectedSubject(null)
		setInputValue('')
		setSearch('')
	}, [platformId])

	// Fetch subjects
	useEffect(() => {
		if (!platformId || !search || search.length < 2) {
			setSubjects([])
			return
		}

		setLoading(true)
		fetch(
			`http://localhost:3000/subjects/search?query=${search}&platformId=${platformId}`,
		)
			.then((res) => res.json())
			.then((data) => setSubjects(data))
			.finally(() => setLoading(false))
	}, [search, platformId])

	// Create subject API call
	const handleCreateSubject = async () => {
		const payload = {
			displayName,
			externalId: externalId || undefined,
			profileUrl: profileUrl || undefined,
			platformId,
		}

		console.log('Creating subject with payload:', payload) // Log the payload for debugging

		const res = await fetch('http://localhost:3000/subjects', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		if (res.ok) {
			const created = await res.json()
			setSubjectId(created.id)
			resetInlineForm()
		} else {
			const error = await res.text()
			alert(`Failed to create subject: ${error}`)
		}
	}

	// Virtual subject logic
	const exactMatch = subjects.some(
		(s) => s.displayName.toLowerCase() === inputValue.toLowerCase(),
	)

	const virtualSubject: Subject | null =
		!exactMatch && inputValue.length >= 2
			? {
					id: `virtual-${inputValue}`,
					displayName: inputValue,
					platformId: platformId!,
				}
			: null

	// Validate button handler
	const handleValidate = () => {
		const match = subjects.find(
			(s) => s.displayName.toLowerCase() === inputValue.toLowerCase(),
		)

		setIsNewSubject(!match)
		setValidateOpen(true)

		if (match) {
			setSelectedSubject(match)
		}
	}

	return (
		<>
			<Box
				sx={{
					mb: 2,
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					minHeight: 120, // ⭐ prevents layout collapse during Autocomplete reflow
				}}
			>
				<Autocomplete
					disabled={disabled}
					options={subjects}
					loading={loading}
					inputValue={inputValue}
					value={selectedSubject || virtualSubject}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					getOptionLabel={(s) => {
						const p = platforms.find((p) => p.id === s.platformId)
						return `${s.displayName} (${p?.name ?? s.platformId})`
					}}
					onInputChange={(e, value, reason) => {
						if (reason === 'reset') return

						if (reason === 'clear') {
							setSelectedSubject(null)
							setSubjectId('')
							setInputValue('')
							setSearch('')
							resetInlineForm()
							return
						}

						if (disabled) return

						setSearch(value)
						setInputValue(value)
						resetInlineForm() // typing resets inline form
					}}
					onChange={(e, subject) => {
						resetInlineForm() // selecting resets inline form
						setSelectedSubject(subject)

						if (subject) {
							setSubjectId(subject.id)
							setInputValue(subject.displayName)
						}
					}}
					renderInput={(params) => {
						const showValidate = inputValue.length >= 2

						return (
							<>
								<TextField
									{...params}
									label='Subject'
									fullWidth
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{loading && <CircularProgress size={20} />}

												{showValidate && (
													<Button
														variant='contained'
														size='small'
														onClick={handleValidate}
														sx={{ ml: 1 }}
													>
														Validate
													</Button>
												)}

												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							</>
						)
					}}
				/>

				{/* Inline creation form (only for new subjects) */}
				{creating && (
					<SubjectCreationForm
						displayName={displayName}
						externalId={externalId}
						profileUrl={profileUrl}
						platformName={platform?.name ?? ''}
						setDisplayName={setDisplayName}
						setExternalId={setExternalId}
						setProfileUrl={setProfileUrl}
						onSubmit={handleCreateSubject}
					/>
				)}
			</Box>

			{/* Validation modal */}
			<ConfirmDialog
				open={validateOpen}
				title='Validate Subject'
				message={
					isNewSubject
						? `Create new subject "${inputValue}" on ${platform?.name}?`
						: `Use existing subject "${selectedSubject?.displayName}" on ${platform?.name}?`
				}
				onCancel={() => {
					setValidateOpen(false)
					resetInlineForm()
				}}
				onConfirm={() => {
					setValidateOpen(false)

					if (!isNewSubject) {
						// Existing subject → done
						setSubjectId(selectedSubject!.id)
						resetInlineForm()
						return
					}

					// New subject → show inline form
					setCreating(true)
					setDisplayName(inputValue)
				}}
			/>
		</>
	)
}
