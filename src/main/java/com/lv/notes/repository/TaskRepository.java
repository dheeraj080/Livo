package com.lv.notes.repository;

import com.lv.notes.domain.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByUserEmail(String email);

    Optional<Task> findByIdAndUserEmail(UUID id, String email);
}
