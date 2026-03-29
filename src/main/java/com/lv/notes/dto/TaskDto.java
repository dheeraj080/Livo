package com.lv.notes.dto;

import com.lv.notes.domain.entity.TaskPriority;
import com.lv.notes.domain.entity.TaskStatus;

import java.util.UUID;

public record TaskDto(

        UUID id,
        String task,
        String description,
        java.time.LocalDateTime dueDate,
        TaskPriority priority,
        TaskStatus status
) {
}
