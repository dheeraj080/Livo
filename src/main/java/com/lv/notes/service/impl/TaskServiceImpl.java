package com.lv.notes.service.impl;

import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.UpdateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.domain.entity.TaskStatus;
import com.lv.notes.exceptions.TaskNotFoundException;
import com.lv.notes.repository.TaskRepository;
import com.lv.notes.service.TaskService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public Task createTask(CreateTaskRequest request) {
        Instant now = Instant.now();

        Task task = new Task(
                null,
                request.title(),
                request.description(),
                request.dueDate().atStartOfDay(),
                TaskStatus.OPEN,
                request.priority(),
                now,
                now
        );

        return taskRepository.save(task);
    }

    @Override
    public List<Task> findAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.ASC, "createdAt"));
    }


    @Override
    public Task updateTask(UUID taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId).orElseThrow(()-> new TaskNotFoundException(taskId));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate().atStartOfDay());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setUpdatedAt(Instant.now());

        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(UUID id) {
        Task task = taskRepository.findById(id).orElseThrow(()-> new TaskNotFoundException(id));
        taskRepository.delete(task);
    }


}
