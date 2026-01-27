package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
    List<Theme> findAllByIsDeletedOrderByLevelAsc(TrueOrFalse isDeleted);

}
