import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Collapse, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  getSubModules,
  createSubModule,
  updateSubModule,
  deleteSubModule,
  reorderSubModules,
} from '../../api/adminModulesApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import ModuleFormDialog from '../../components/admin/ModuleFormDialog';
import SubModuleFormDialog from '../../components/admin/SubModuleFormDialog';
import { MODULE_ICON_OPTIONS, MODULE_ICON_FALLBACK } from '../../constants/moduleIcons';

export default function Modules() {
  const navigate = useNavigate();
  const [modules, setModules] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [subModulesByModule, setSubModulesByModule] = useState({});

  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [deletingModule, setDeletingModule] = useState(false);

  const [subModuleFormOpen, setSubModuleFormOpen] = useState(false);
  const [editingSubModule, setEditingSubModule] = useState(null);
  const [subModuleToDelete, setSubModuleToDelete] = useState(null);
  const [deletingSubModule, setDeletingSubModule] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);

  function fetchModules() {
    setError('');
    getModules()
      .then(setModules)
      .catch(() => setError('Impossible de charger les modules pour le moment.'));
  }

  useEffect(() => {
    fetchModules();
  }, []);

  async function refreshSubModules(moduleId) {
    const subs = await getSubModules(moduleId);
    setSubModulesByModule((prev) => ({ ...prev, [moduleId]: subs }));
  }

  async function toggleExpand(moduleId) {
    if (expandedId === moduleId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(moduleId);
    if (!subModulesByModule[moduleId]) {
      try {
        await refreshSubModules(moduleId);
      } catch {
        setError('Impossible de charger les sous-modules pour le moment.');
      }
    }
  }

  async function handleModuleFormSubmit(values) {
    if (editingModule) {
      await updateModule(editingModule._id, values);
      setSnackbar('Module mis à jour.');
    } else {
      await createModule(values);
      setSnackbar('Module créé.');
    }
    setModuleFormOpen(false);
    setEditingModule(null);
    fetchModules();
  }

  async function handleConfirmDeleteModule() {
    setDeletingModule(true);
    try {
      await deleteModule(moduleToDelete._id);
      setModuleToDelete(null);
      setSnackbar('Module supprimé.');
      fetchModules();
    } catch (err) {
      setError(err?.response?.data?.message || 'La suppression a échoué.');
    } finally {
      setDeletingModule(false);
    }
  }

  async function moveModule(sortedModules, module, direction) {
    const index = sortedModules.findIndex((m) => m._id === module._id);
    const swapWith = direction === 'up' ? sortedModules[index - 1] : sortedModules[index + 1];
    if (!swapWith) return;

    try {
      await reorderModules([
        { id: module._id, order: swapWith.order },
        { id: swapWith._id, order: module.order },
      ]);
      fetchModules();
    } catch {
      setError('Le réordonnancement a échoué.');
    }
  }

  async function handleSubModuleFormSubmit(values) {
    if (editingSubModule) {
      await updateSubModule(editingSubModule._id, values);
      setSnackbar('Sous-module mis à jour.');
    } else {
      await createSubModule({ ...values, moduleId: activeModuleId });
      setSnackbar('Sous-module créé.');
    }
    setSubModuleFormOpen(false);
    setEditingSubModule(null);
    await refreshSubModules(activeModuleId);
  }

  async function handleConfirmDeleteSubModule() {
    setDeletingSubModule(true);
    try {
      await deleteSubModule(subModuleToDelete._id);
      setSubModuleToDelete(null);
      setSnackbar('Sous-module supprimé.');
      await refreshSubModules(activeModuleId);
    } catch (err) {
      setError(err?.response?.data?.message || 'La suppression a échoué.');
    } finally {
      setDeletingSubModule(false);
    }
  }

  async function moveSubModule(moduleId, sortedSubModules, subModule, direction) {
    const index = sortedSubModules.findIndex((s) => s._id === subModule._id);
    const swapWith = direction === 'up' ? sortedSubModules[index - 1] : sortedSubModules[index + 1];
    if (!swapWith) return;

    try {
      await reorderSubModules([
        { id: subModule._id, order: swapWith.order },
        { id: swapWith._id, order: subModule.order },
      ]);
      await refreshSubModules(moduleId);
    } catch {
      setError('Le réordonnancement a échoué.');
    }
  }

  if (error && !modules) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!modules) {
    return <LoadingSpinner label="Chargement des modules…" minHeight={300} />;
  }

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Modules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez la hiérarchie du contenu pédagogique.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            setEditingModule(null);
            setModuleFormOpen(true);
          }}
        >
          Nouveau module
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {sortedModules.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Aucun module"
          description="Créez votre premier module pour commencer."
          action={
            <Button variant="contained" onClick={() => setModuleFormOpen(true)}>
              Créer un module
            </Button>
          }
        />
      ) : (
        <Stack spacing={2}>
          {sortedModules.map((module, index) => {
            const Icon = MODULE_ICON_OPTIONS[module.icon] || MODULE_ICON_FALLBACK;
            const isExpanded = expandedId === module._id;
            const subModules = subModulesByModule[module._id];
            const sortedSubModules = subModules ? [...subModules].sort((a, b) => a.order - b.order) : null;

            return (
              <Paper key={module._id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', p: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${module.color || '#9D4EDD'}1A`,
                      color: module.color || '#9D4EDD',
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {module.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.25}>
                    <IconButton size="small" onClick={() => moveModule(sortedModules, module, 'up')} disabled={index === 0}>
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => moveModule(sortedModules, module, 'down')}
                      disabled={index === sortedModules.length - 1}
                    >
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingModule(module);
                        setModuleFormOpen(true);
                      }}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setModuleToDelete(module)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(module._id)}
                      sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    >
                      <ExpandMoreRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Collapse in={isExpanded}>
                  <Box sx={{ px: 2, pb: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Sous-modules
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => {
                          setActiveModuleId(module._id);
                          setEditingSubModule(null);
                          setSubModuleFormOpen(true);
                        }}
                      >
                        Ajouter
                      </Button>
                    </Stack>

                    {!sortedSubModules ? (
                      <LoadingSpinner minHeight={80} />
                    ) : sortedSubModules.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Aucun sous-module pour l'instant.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {sortedSubModules.map((sm, smIndex) => (
                          <Stack
                            key={sm._id}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5, flexWrap: 'wrap' }}
                          >
                            <Box sx={{ flexGrow: 1, minWidth: 120 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {sm.title}
                              </Typography>
                              {sm.estimatedDuration ? (
                                <Typography variant="caption" color="text.secondary">
                                  {sm.estimatedDuration} min
                                </Typography>
                              ) : null}
                            </Box>
                            <Tooltip title="Gérer la leçon">
                              <IconButton size="small" onClick={() => navigate(`/admin/lecons?subModuleId=${sm._id}`)}>
                                <MenuBookRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Gérer le quiz">
                              <IconButton size="small" onClick={() => navigate(`/admin/quiz?subModuleId=${sm._id}`)}>
                                <QuizRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Gérer les exercices">
                              <IconButton size="small" onClick={() => navigate(`/admin/exercices?subModuleId=${sm._id}`)}>
                                <FitnessCenterRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              onClick={() => moveSubModule(module._id, sortedSubModules, sm, 'up')}
                              disabled={smIndex === 0}
                            >
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => moveSubModule(module._id, sortedSubModules, sm, 'down')}
                              disabled={smIndex === sortedSubModules.length - 1}
                            >
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setActiveModuleId(module._id);
                                setEditingSubModule(sm);
                                setSubModuleFormOpen(true);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setActiveModuleId(module._id);
                                setSubModuleToDelete(sm);
                              }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      )}

      <ModuleFormDialog
        open={moduleFormOpen}
        module={editingModule}
        onClose={() => {
          setModuleFormOpen(false);
          setEditingModule(null);
        }}
        onSubmit={handleModuleFormSubmit}
      />

      <SubModuleFormDialog
        open={subModuleFormOpen}
        subModule={editingSubModule}
        onClose={() => {
          setSubModuleFormOpen(false);
          setEditingSubModule(null);
        }}
        onSubmit={handleSubModuleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(moduleToDelete)}
        title="Supprimer ce module ?"
        description={
          moduleToDelete
            ? `« ${moduleToDelete.title} » sera définitivement supprimé. Le module doit être vide (aucun sous-module).`
            : ''
        }
        onCancel={() => setModuleToDelete(null)}
        onConfirm={handleConfirmDeleteModule}
        loading={deletingModule}
      />

      <ConfirmDialog
        open={Boolean(subModuleToDelete)}
        title="Supprimer ce sous-module ?"
        description={
          subModuleToDelete
            ? `« ${subModuleToDelete.title} » sera définitivement supprimé. Il doit être vide (aucune leçon, quiz ou exercice).`
            : ''
        }
        onCancel={() => setSubModuleToDelete(null)}
        onConfirm={handleConfirmDeleteSubModule}
        loading={deletingSubModule}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
