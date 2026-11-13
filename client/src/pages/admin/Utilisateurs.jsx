import { useCallback, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import { listUsers, createUser, updateUser, deleteUser, resetPassword } from '../../api/adminUsersApi';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserFormDialog from '../../components/admin/UserFormDialog';
import UserDetailPanel from '../../components/admin/UserDetailPanel';
import ResetPasswordResultDialog from '../../components/admin/ResetPasswordResultDialog';

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Utilisateurs() {
  const theme = useTheme();
  // Admin = usage desktop prioritaire (§12.1), mais le DataGrid reste
  // "utilisable" sur mobile en masquant les colonnes secondaires plutôt
  // qu'en forçant un défilement horizontal sur ~1000px de colonnes fixes.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [snackbar, setSnackbar] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError('');
    listUsers({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      role: roleFilter || undefined,
      isActive: statusFilter || undefined,
      sortBy: sortModel[0]?.field,
      sortOrder: sortModel[0]?.sort,
    })
      .then((data) => {
        setRows(data.items);
        setRowCount(data.total);
      })
      .catch(() => setError('Impossible de charger les utilisateurs pour le moment.'))
      .finally(() => setLoading(false));
  }, [paginationModel, search, roleFilter, statusFilter, sortModel]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function resetToFirstPage() {
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }

  async function handleToggleActive(user) {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de modifier le statut pour le moment.');
    }
  }

  async function handleFormSubmit(values) {
    if (editingUser) {
      await updateUser(editingUser.id, values);
      setSnackbar('Utilisateur modifié.');
    } else {
      await createUser(values);
      setSnackbar('Utilisateur créé.');
    }
    setFormOpen(false);
    setEditingUser(null);
    fetchUsers();
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      setSnackbar('Utilisateur supprimé.');
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'La suppression a échoué.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleResetPassword(user) {
    try {
      const { temporaryPassword } = await resetPassword(user.id);
      setResetResult({ username: user.username, temporaryPassword });
    } catch (err) {
      setError(err?.response?.data?.message || 'La réinitialisation a échoué.');
    }
  }

  // Pas de useMemo ici : les cellules ferment sur handleToggleActive /
  // handleResetPassword, qui référencent fetchUsers (recréé à chaque
  // changement de filtre/pagination) — les mémoriser figerait ces handlers
  // sur leur toute première version et rappellerait un fetchUsers obsolète.
  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar src={params.row.profilePicture || undefined} sx={{ width: 32, height: 32 }}>
          {params.row.username?.[0]?.toUpperCase()}
        </Avatar>
      ),
    },
    { field: 'username', headerName: "Nom d'utilisateur", flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'E-mail', flex: 1.3, minWidth: 180 },
    {
      field: 'role',
      headerName: 'Rôle',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value === 'admin' ? 'Administrateur' : 'Élève'}
          size="small"
          color={params.value === 'admin' ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Inscription',
      width: 130,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'progressPercent',
      headerName: 'Progression',
      width: 110,
      sortable: false,
      valueFormatter: (value) => (value === null || value === undefined ? '—' : `${value}%`),
    },
    {
      field: 'isActive',
      headerName: 'Statut',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Switch checked={params.value} onChange={() => handleToggleActive(params.row)} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Voir le détail">
            <IconButton size="small" onClick={() => setDetailUserId(params.row.id)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => {
                setEditingUser(params.row);
                setFormOpen(true);
              }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Réinitialiser le mot de passe">
            <IconButton size="small" onClick={() => handleResetPassword(params.row)}>
              <LockResetRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={() => setUserToDelete(params.row)}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les comptes élèves et administrateurs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
        >
          Créer un utilisateur
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Rechercher (nom, e-mail)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetToFirstPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          select
          label="Rôle"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            resetToFirstPage();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="student">Élève</MenuItem>
          <MenuItem value="admin">Administrateur</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          label="Statut"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            resetToFirstPage();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="true">Actif</MenuItem>
          <MenuItem value="false">Désactivé</MenuItem>
        </TextField>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 25, 50]}
          disableColumnMenu
          disableRowSelectionOnClick
          autoHeight
          columnVisibilityModel={isMobile ? { createdAt: false, progressPercent: false } : undefined}
        />
      </Box>

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <UserDetailPanel userId={detailUserId} onClose={() => setDetailUserId(null)} />

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Supprimer cet utilisateur ?"
        description={
          userToDelete
            ? `« ${userToDelete.username} » ainsi que toutes ses données (tâches, notes, événements, progression) seront définitivement supprimées.`
            : ''
        }
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <ResetPasswordResultDialog result={resetResult} onClose={() => setResetResult(null)} />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
