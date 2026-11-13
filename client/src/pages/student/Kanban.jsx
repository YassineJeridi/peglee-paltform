import { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasksApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import KanbanColumn from '../../components/student/KanbanColumn';
import TaskFormDialog from '../../components/student/TaskFormDialog';

const COLUMNS = [
  { id: 'todo', title: 'À faire' },
  { id: 'doing', title: 'En cours' },
  { id: 'done', title: 'Terminé' },
];

export default function Kanban() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getTasks()
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger vos tâches pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function tasksByColumn(status) {
    return (tasks || []).filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    const newOrder = destination.index;
    const previousTasks = tasks;

    // Mise à jour optimiste de l'UI, avec réconciliation si l'appel échoue.
    setTasks((prev) => {
      const moved = prev.find((t) => t._id === draggableId);
      const rest = prev.filter((t) => t._id !== draggableId);
      const columnTasks = rest.filter((t) => t.status === newStatus).sort((a, b) => a.order - b.order);
      columnTasks.splice(newOrder, 0, { ...moved, status: newStatus });
      const reindexedColumn = columnTasks.map((t, i) => ({ ...t, order: i }));
      const otherColumns = rest.filter((t) => t.status !== newStatus);
      return [...otherColumns, ...reindexedColumn];
    });

    try {
      await updateTask(draggableId, { status: newStatus, order: newOrder });
    } catch {
      setTasks(previousTasks);
      setError('Le déplacement de la tâche a échoué. Réessayez.');
    }
  }

  async function handleFormSubmit(values) {
    if (editingTask) {
      const updated = await updateTask(editingTask._id, values);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSnackbar('Tâche mise à jour.');
    } else {
      const created = await createTask(values);
      setTasks((prev) => [...prev, created]);
      setSnackbar('Tâche créée.');
    }
    setFormOpen(false);
    setEditingTask(null);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setTaskToDelete(null);
      setSnackbar('Tâche supprimée.');
    } catch {
      setError('La suppression a échoué. Réessayez.');
    } finally {
      setDeleting(false);
    }
  }

  function openCreateForm() {
    setEditingTask(null);
    setFormOpen(true);
  }

  if (error && !tasks) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!tasks) {
    return <LoadingSpinner label="Chargement de votre tableau…" minHeight={300} />;
  }

  const isEmpty = tasks.length === 0;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Kanban
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organisez vos révisions en trois colonnes.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateForm}>
          Nouvelle tâche
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isEmpty ? (
        <EmptyState
          icon="🗂️"
          title="Aucune tâche pour l'instant"
          description="Organisez votre travail en créant votre première tâche."
          action={
            <Button variant="contained" onClick={openCreateForm}>
              Créer une tâche
            </Button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={tasksByColumn(col.id)}
                onEdit={(task) => {
                  setEditingTask(task);
                  setFormOpen(true);
                }}
                onDelete={setTaskToDelete}
              />
            ))}
          </Box>
        </DragDropContext>
      )}

      <TaskFormDialog
        open={formOpen}
        task={editingTask}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Supprimer la tâche ?"
        description={taskToDelete ? `« ${taskToDelete.title} » sera définitivement supprimée.` : ''}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
