package com.lv.notes.mapper.impl;

import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.UpdateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.dto.TaskDto;
import com.lv.notes.dto.UpdateTaskRequestDto;
import com.lv.notes.mapper.TaskMapper;
import org.springframework.stereotype.Component;

@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public CreateTaskRequest fromDto(CreateTaskRequest dto) {
        return new CreateTaskRequest(
                dto.title(),
                dto.description(),
                dto.dueDate(),
                dto.priority()
        );
    }

    @Override
    public TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.getStatus()
        );
    }

    @Override
    public UpdateTaskRequest fromDto(UpdateTaskRequestDto dto) {
        return new UpdateTaskRequest(
                dto.title(),
                dto.description(),
                dto.dueDate(),
                dto.status(),
                dto.priority()

        );
    }
}
