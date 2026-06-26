import Chip from '@mui/material/Chip'
import VideocamIcon from '@mui/icons-material/Videocam'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import BugReportIcon from '@mui/icons-material/BugReport'
import ReportIcon from '@mui/icons-material/Report'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import XboxIcon from '@mui/icons-material/SportsEsports' // placeholder
import PlayStationIcon from '@mui/icons-material/SportsEsports' // placeholder
import ComputerIcon from '@mui/icons-material/Computer'

export const PLATFORM_ICONS: Record<string, JSX.Element> = {
  'ubisoft-connect': <ComputerIcon fontSize="small" />,
  'xbox-live': <XboxIcon fontSize="small" />,
  'psn': <PlayStationIcon fontSize="small" />,
}

export function renderPlatformIcon(platformId: string) {
  return PLATFORM_ICONS[platformId] || <SportsEsportsIcon fontSize="small" />
}

// ─────────────────────────────────────────
// CASE STATUS
// ─────────────────────────────────────────

export const CASE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  PENDING_EVIDENCE: 'Pending Evidence',
  ESCALATED: 'Escalated',
  CLOSED: 'Closed',
  DISMISSED: 'Dismissed',
}

export const CASE_STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
  OPEN: 'default',
  UNDER_REVIEW: 'primary',
  PENDING_EVIDENCE: 'warning',
  ESCALATED: 'error',
  CLOSED: 'success',
  DISMISSED: 'default',
}

export function renderCaseStatus(status: string) {
  return (
    <Chip
      label={CASE_STATUS_LABELS[status] || status}
      color={CASE_STATUS_COLORS[status] || 'default'}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  )
}

// ─────────────────────────────────────────
// CASE PRIORITY
// ─────────────────────────────────────────

export const CASE_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const CASE_PRIORITY_COLORS: Record<
  string,
  'default' | 'primary' | 'warning' | 'error'
> = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  CRITICAL: 'error',
}

export function renderCasePriority(priority: string) {
  return (
    <Chip
      label={CASE_PRIORITY_LABELS[priority] || priority}
      color={CASE_PRIORITY_COLORS[priority] || 'default'}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  )
}

// ─────────────────────────────────────────
// EVIDENCE TYPE → ICONS
// ─────────────────────────────────────────

export const EVIDENCE_TYPE_ICONS: Record<string, JSX.Element> = {
  SCREENSHOT: <ImageIcon fontSize="small" />,
  VIDEO: <VideocamIcon fontSize="small" />,
  LOG_FILE: <DescriptionIcon fontSize="small" />,
  REPLAY_FILE: <VideocamIcon fontSize="small" />,
  EXTERNAL_REPORT: <ReportIcon fontSize="small" />,
  API_DATA: <BugReportIcon fontSize="small" />,
  OTHER: <DescriptionIcon fontSize="small" />,
}

export function renderEvidenceType(type: string) {
  return EVIDENCE_TYPE_ICONS[type] || null
}
