package com.lv.notes.service;

import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.UpdateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.domain.entity.User; // Import User

import java.util.List;
import java.util.UUID;

public interface TaskService {

    // Now accepts the User who is creating the task
    Task createTask(CreateTaskRequest request, User user);

    // Now filters by the logged-in user's email
    List<Task> findAllTasks(String email);

    // Ensures the user owns the task they are trying to update
    Task updateTask(UUID taskId, UpdateTaskRequest request, String email);

    // Ensures the user owns the task they are trying to delete
    void deleteTask(UUID taskId, String email);
}