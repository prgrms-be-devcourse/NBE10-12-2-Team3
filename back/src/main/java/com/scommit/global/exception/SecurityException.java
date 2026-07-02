package com.scommit.global.exception;

import com.scommit.global.dto.RsData;

// TODO: BuisinessException과 통합 또는 다른 방법 강구
// Exception을 14183과 분리하기 위한 임시 예외 클래스입니다.
public class SecurityException extends RuntimeException {
    private final String resultCode;
    private final String msg;

    public SecurityException(String resultCode, String msg) {
        super(resultCode + " : " + msg);
        this.resultCode = resultCode;
        this.msg = msg;
    }

    public RsData<Void> getRsData() {
        return new RsData<>(resultCode, msg, null);
    }
}
