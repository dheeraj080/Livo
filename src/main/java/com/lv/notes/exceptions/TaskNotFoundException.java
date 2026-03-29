package com.lv.notes.exceptions;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString
public class TaskNotFoundException extends RuntimeException{

    private final UUID id;

    public TaskNotFoundException(UUID id) {
        super(String.format("Task with id %s not found", id));
        this.id = id;
    }


}
