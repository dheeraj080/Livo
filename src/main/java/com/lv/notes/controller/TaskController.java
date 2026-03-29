package com.lv.notes.controller;

import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.domain.entity.User;
import com.lv.notes.dto.TaskDto;
import com.lv.notes.mapper.TaskMapper;
import com.lv.notes.repository.UserRepository;
import com.lv.notes.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @RequestBody CreateTaskRequest requestDto,
            Principal principal
    ) {
        System.out.println("LOG: Request received from Principal: [" + principal.getName() + "]");
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskService.createTask(requestDto, user);
        return new ResponseEntity<>(taskMapper.toDto(task), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> findAllTasks(Principal principal) {
        List<Task> tasks = taskService.findAllTasks(principal.getName());
        return ResponseEntity.ok(tasks.stream().map(taskMapper::toDto).toList());
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId, Principal principal) {
        taskService.deleteTask(taskId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}