package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.response.ThemeListRespDto;
import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.domain.room.repository.ThemeRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeService {

    private final ThemeRepository themeRepository;

    // 테마 목록 조회
    public ThemeListRespDto getThemeList() {

        List<Theme> themes = themeRepository.findAllByIsDeletedOrderByLevelAsc(TrueOrFalse.F);
        return ThemeListRespDto.success(themes);

    }
}
