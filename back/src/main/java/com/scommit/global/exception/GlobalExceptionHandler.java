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
     * @RequestBody JSON 바인딩 에러 처리 (@Valid 유효성 검사 실패 시)
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    protected ResponseEntity<RsData<Void>> handleMethodArgumentNotValidException(org.springframework.web.bind.MethodArgumentNotValidException e) {
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("MethodArgumentNotValidException: {}", errorMessage);
        
        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;
        RsData<Void> rsData = new RsData<>(
                errorCode.getCode(), 
                errorMessage != null ? errorMessage : errorCode.getMessage()
        );
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }

    /**
     * @ModelAttribute 등 바인딩 에러 처리 (쿼리 스트링, 폼 데이터 유효성 검사 실패 시)
     */
    @ExceptionHandler(BindException.class)
    protected ResponseEntity<RsData<Void>> handleBindException(BindException e) {
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("BindException: {}", errorMessage);
        
        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;
        RsData<Void> rsData = new RsData<>(
                errorCode.getCode(), 
                errorMessage != null ? errorMessage : errorCode.getMessage()
        );
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }

    /**
     * URL 경로 변수나 쿼리 파라미터의 데이터 타입이 일치하지 않을 때 (예: Long 자리에 String 입력)
     */
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    protected ResponseEntity<RsData<Void>> handleMethodArgumentTypeMismatchException(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException e) {
        log.warn("TypeMismatchException: 파라미터 '{}'에 잘못된 값 '{}'가 입력되었습니다.", e.getName(), e.getValue());
        
        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;
        String errorMessage = String.format("'%s' 항목에 올바르지 않은 타입의 값이 입력되었습니다.", e.getName());
        
        RsData<Void> rsData = new RsData<>(errorCode.getCode(), errorMessage);
        return new ResponseEntity<>(rsData, errorCode.getHttpStatus());
    }

    /**
     * JSON 파싱 에러 처리 (클라이언트가 잘못된 JSON 포맷을 보냈을 때)
     */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    protected ResponseEntity<RsData<Void>> handleHttpMessageNotReadableException(org.springframework.http.converter.HttpMessageNotReadableException e) {
        log.warn("HttpMessageNotReadableException: {}", e.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;
        RsData<Void> rsData = new RsData<>(errorCode.getCode(), "올바른 JSON 요청 형식이 아닙니다.");
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
