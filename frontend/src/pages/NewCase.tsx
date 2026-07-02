import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import SubjectSelector from '../components/SubjectSelector'

interface Game {
  id: string
  name: string
}

interface Platform {
  id: string
  name: string
}

export default function NewCase() {
  const navigate = useNavigate()

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [subjectId, setSubjectId] = useState('')
  const [gameId, setGameId] = useState('')
  const [platformId, setPlatformId] = useState('')

  // Validation errors
  const [titleError, setTitleError] = useState('')
  const [platformError, setPlatformError] = useState('')
  const [gameError, setGameError] = useState('')

  // Data
  const [games, setGames] = useState<Game[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])

  // Fetch dropdown data
  useEffect(() => {
    fetch('http://localhost:3000/games')
      .then((res) => res.json())
      .then(setGames)

    fetch('http://localhost:3000/platforms')
      .then((res) => res.json())
      .then(setPlatforms)
  }, [])

  // Validation logic
  const validate = () => {
    let valid = true

    if (!title.trim()) {
      setTitleError('Title is required')
      valid = false
    } else {
      setTitleError('')
    }

    if (!platformId) {
      setPlatformError('Platform is required')
      valid = false
    } else {
      setPlatformError('')
    }

    if (!gameId) {
      setGameError('Game is required')
      valid = false
    } else {
      setGameError('')
    }

    if (!subjectId) {
      valid = false
    }

    return valid
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const payload = {
      title,
      description,
      priority,
      subjectId,
      gameId,
      platformId,
      openedById: 'system-ingest-user',
    }

    console.log('Submitting payload:', payload)

    const res = await fetch('http://localhost:3000/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const created = await res.json()
      navigate(`/cases/${created.id}`)
    } else {
      console.error('Failed to create case')
    }
  }

  const canCreateCase =
    title.trim() &&
    platformId &&
    gameId &&
    subjectId

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add New Case
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          error={Boolean(titleError)}
          helperText={titleError}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        <TextField
          select
          label="Platform"
          value={platformId}
          onChange={(e) => setPlatformId(e.target.value)}
          error={Boolean(platformError)}
          helperText={platformError}
        >
          {platforms.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        <SubjectSelector
          subjectId={subjectId}
          setSubjectId={setSubjectId}
          platformId={platformId}
          platforms={platforms}
          disabled={!platformId}
        />

        <TextField
          select
          label="Game"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          error={Boolean(gameError)}
          helperText={gameError}
        >
          {games.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="CRITICAL">Critical</MenuItem>
        </TextField>

        <Button
          disabled={!canCreateCase}
          variant="contained"
          onClick={handleSubmit}
        >
          Create Case
        </Button>
      </Box>
    </Paper>
  )
}
