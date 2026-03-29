package com.lv.notes.service.impl;

import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.UpdateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.domain.entity.TaskStatus;
import com.lv.notes.domain.entity.User;
import com.lv.notes.exceptions.TaskNotFoundException;
import com.lv.notes.repository.TaskRepository;
import com.lv.notes.service.TaskService;
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
    public Task createTask(CreateTaskRequest request, User user) {
        return taskRepository.save(
                Task.builder()
                        .id(null)
                        .title(request.title())
                        .description(request.description())
                        .dueDate(request.dueDate().atStartOfDay())
                        .status(TaskStatus.OPEN)
                        .priority(request.priority())
                        .user(user)       // This solves the 'cannot be applied' error
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );
    }

//    @Override
//    public List<Task> findAllTasks(String email) {
//        return taskRepository.findAllByUserEmail(email);
//    }

    @Override
    public Task updateTask(UUID taskId, UpdateTaskRequest request, String email) {
        // Secure lookup: Only find the task if it belongs to this email
        Task task = taskRepository.findByIdAndUserEmail(taskId, email)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate().atStartOfDay());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setUpdatedAt(Instant.now());

        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(UUID id, String email) {
        // Secure lookup before delete
        Task task = taskRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new TaskNotFoundException(id));
        taskRepository.delete(task);
    }

    @Override
    public List<Task> findAllTasks(String email) {
        System.out.println("DEBUG: Fetching tasks for email: [" + email + "]");
        List<Task> results = taskRepository.findAllByUserEmail(email);
        System.out.println("DEBUG: Found " + results.size() + " tasks");
        return results;
    }
}