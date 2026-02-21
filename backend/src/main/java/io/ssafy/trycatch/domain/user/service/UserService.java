package io.ssafy.trycatch.domain.user.service;

import io.ssafy.trycatch.domain.user.dto.response.SubmissionHistoryRespDto;
import io.ssafy.trycatch.domain.user.dto.response.UserProfileRespDto;
import io.ssafy.trycatch.domain.user.dto.response.SubmissionHistoryRespDto.PageInfo;
import io.ssafy.trycatch.domain.user.dto.response.SubmissionHistoryRespDto.SubmissionHistory;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.mapper.UserMapper;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    // 프로필 조회
    public UserProfileRespDto getProfile(Long userId) {
        log.info("프로필 조회 요청 - userId: {}", userId);

        // DB에서 id 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return UserProfileRespDto.success(user);
    }

    // 제출 기록 조회
//    public SubmissionHistoryRespDto getSubmissionHistory(Long userId, int page, int size) {
//        log.info("제출 기록 조회 요청 - userId: {}, page: {}, size: {}", userId, page, size);
//
//        // 유저 존재 확인
//        userRepository.findByIdAndIsDeleted(userId, TrueOrFalse.F)
//                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
//
//        // 페이지네이션 계산
//        int offset = (page - 1) * size;
//
//        // 데이터 조회
//        List<SubmissionHistory> submissions = userMapper.findSubmissionHistory(userId, size, offset);
//        long totalElements = userMapper.countSubmissionHistory(userId);
//        int totalPages = (int) Math.ceil((double) totalElements / size);
//
//        // 페이지 정보
//        PageInfo pageInfo = PageInfo.builder()
//                .currentPage(page)
//                .totalPages(totalPages)
//                .totalElements(totalElements)
//                .size(size)
//                .build();
//
//        return SubmissionHistoryRespDto.success(submissions, pageInfo);
//    }

    // 제출 기록 조회(수정 버전)
    public SubmissionHistoryRespDto getSuccessThemes(long userId, String mode, int page, int size){
        // 유저 존재 확인
        userRepository.findByIdAndIsDeleted(userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 페이지네이션 계산
        int offset = (page - 1) * size;

        // 데이터 조회
        List<SubmissionHistory> submissions = null;

        if (mode.equals("single")){
            submissions = userMapper.findSingleSuccessThemes(userId, size, offset);
        } else if(mode.equals("multi")){
            submissions = userMapper.findMultiSuccessThemes(userId, size, offset);
        }

        long totalElements = userMapper.countSubmissionHistory(userId);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // 페이지 정보
        PageInfo pageInfo = PageInfo.builder()
                .currentPage(page)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .size(size)
                .build();

        return SubmissionHistoryRespDto.success(submissions, pageInfo);
    }

}