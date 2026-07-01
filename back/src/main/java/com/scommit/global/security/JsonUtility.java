package com.scommit.global.security;

import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

// 14183의 Ut의 static class json 해당하는 임시 클래스입니다. 추후 없애거나 위치/이름을 변경할 수 있습니다.
@Component
public class JsonUtility { // 14183 Ut의 일부에 해당
    public static ObjectMapper objectMapper;

    public JsonUtility(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public static String toString(Object object) {
        return toString(object, null);
    }

    public static String toString(Object object, String defaultValue) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
