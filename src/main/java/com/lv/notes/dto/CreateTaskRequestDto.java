package com.lv.notes.dto;

import com.lv.notes.domain.entity.TaskPriority;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

public record CreateTaskRequestDto(

        @NotBlank(message = "Title Cannot be Blank")
        @Length(min = 1, max = 255, message = "Max 255 Characters")
        String title,

        @Length(max = 1000, message = "Max 1000 Characters")
        @Nullable
        String description,

        @Nullable
        LocalDate dueDate,

        @NotNull(message = "Plz provide task priority")
        TaskPriority priority
) {
}
