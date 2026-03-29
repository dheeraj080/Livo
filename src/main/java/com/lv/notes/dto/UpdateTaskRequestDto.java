package com.lv.notes.dto;

import com.lv.notes.domain.entity.TaskPriority;
import com.lv.notes.domain.entity.TaskStatus;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

public record UpdateTaskRequestDto(

        @NotBlank(message = "Title Cannot be Blank")
        @Length(min = 1, max = 255, message = "Max 255 Characters")
        String title,

        @Length(max = 1000, message = "Max 1000 Characters")
        @Nullable
        String description,

        @Nullable
        LocalDate dueDate,

        @NotNull(message = "Plz provide task priority")
        TaskPriority priority,

        @NotNull(message = "Plz provide task Status")
        TaskStatus status

) {
}
