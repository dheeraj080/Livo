package com.lv.notes.mapper;


import com.lv.notes.domain.CreateTaskRequest;
import com.lv.notes.domain.UpdateTaskRequest;
import com.lv.notes.domain.entity.Task;
import com.lv.notes.dto.TaskDto;
import com.lv.notes.dto.UpdateTaskRequestDto;

public interface TaskMapper {

    CreateTaskRequest fromDto(CreateTaskRequest dto);

    TaskDto toDto(Task task);

    UpdateTaskRequest fromDto(UpdateTaskRequestDto dto);


}
