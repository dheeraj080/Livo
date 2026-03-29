package com.lv.notes.domain;

import com.lv.notes.domain.entity.TaskPriority;
import com.lv.notes.domain.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UpdateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority
) {
}
