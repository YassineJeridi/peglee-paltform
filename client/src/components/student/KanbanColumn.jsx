import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import TaskCard from './TaskCard';

function KanbanColumn({ id, title, tasks, onEdit, onDelete }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Chip label={tasks.length} size="small" />
      </Stack>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={1.5}
            sx={{
              flexGrow: 1,
              minHeight: 96,
              p: 0.5,
              borderRadius: 1,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              transition: 'background-color 0.15s',
            }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    sx={{ opacity: dragSnapshot.isDragging ? 0.85 : 1 }}
                  >
                    <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </Paper>
  );
}

export default KanbanColumn;
