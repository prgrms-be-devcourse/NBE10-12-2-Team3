package com.scommit.global.exception;

import com.scommit.global.dto.RsData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 커스텀 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<RsData<Void>> handleBusinessException(BusinessException e) {
        log.warn("BusinessException: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        RsData<Void> rsData = new RsData<>(errorCode.getCode(), errorCode.getMessage());
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }

    /**
     * @Valid 등 바인딩 에러 처리 (DTO 유효성 검사 실패 시)
     */
    @ExceptionHandler(BindException.class)
    protected ResponseEntity<RsData<Void>> handleBindException(BindException e) {
        log.warn("BindException: {}", e.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        
        RsData<Void> rsData = new RsData<>(
                errorCode.getCode(), 
                errorMessage != null ? errorMessage : errorCode.getMessage()
        );
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }

    /**
     * 핸들링 되지 않은 나머지 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<RsData<Void>> handleException(Exception e) {
        log.error("Exception", e);
        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        RsData<Void> rsData = new RsData<>(errorCode.getCode(), errorCode.getMessage());
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }
}
