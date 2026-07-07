import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * [성능 테스트 (Performance Test)]
 * 목적: 평시 및 최대 트래픽 상황에서 시스템이 목표 성능(응답시간 500ms, 에러율 1% 미만)을 유지하는지 확인
 */
export const options = {
    stages: [
        { duration: '1m', target: 10 },   // 워밍업
        { duration: '3m', target: 50 },   // 일반 부하
        { duration: '2m', target: 100 },  // 최대 부하
        { duration: '1m', target: 0 },    // 쿨다운
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95%의 요청이 500ms 이하
        http_req_failed: ['rate<0.01'],   // 에러율 1% 미만
    },
};

// 환경 변수 기반 유연한 BASE_URL 처리 (기본값 localhost)
// 실행 예시: k6 run -e BASE_URL=http://54.252.83.173:8080 performance_test.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const MAX_RECORD_ID = 10000; // DB 더미 데이터 최대치에 맞게 조절하세요

export function setup() {
    // 테스트 시작 전 공통 로그인
    const res = http.post(`${BASE_URL}/api/users/login`, JSON.stringify({ email: 'user1@test.com', password: 'password123' }), {
        headers: { 'Content-Type': 'application/json' }
    });
    return { cookies: res.cookies };
}

export default function (data) {
    // 1~10000 랜덤 ID 생성으로 DB 캐시 방지
    const randomId = Math.floor(Math.random() * MAX_RECORD_ID) + 1;
    const randomAction = Math.random();
    
    let res;

    if (randomAction < 0.7) {
        // [1순위] 게시글 조회 (70%)
        res = http.get(`${BASE_URL}/api/posts/${randomId}`, { cookies: data.cookies });
        check(res, { 'Post Status 200': (r) => r.status === 200 });
    } 
    else if (randomAction < 0.9) {
        // [2순위] 크리에이터 프로필 조회 (20%)
        res = http.get(`${BASE_URL}/api/users/${randomId}`, { cookies: data.cookies });
        check(res, { 'User Profile Status 200': (r) => r.status === 200 });
    } 
    else {
        // [3순위] 시리즈 상세 조회 (10%)
        res = http.get(`${BASE_URL}/api/series/${randomId}`, { cookies: data.cookies });
        check(res, { 'Series Status 200': (r) => r.status === 200 });
    }

    // 실제 유저처럼 Think Time 부여 (0.5초 ~ 2초)
    sleep(Math.random() * 1.5 + 0.5);
}
