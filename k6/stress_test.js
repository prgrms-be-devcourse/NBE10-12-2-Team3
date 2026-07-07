import http from 'k6/http';
import { check } from 'k6';

/**
 * [스트레스 테스트 (Stress Test)]
 * 목적: 시스템이 어디까지 버틸 수 있는지(한계점, Breaking Point) 탐색
 */
export const options = {
    stages: [
        { duration: '1m', target: 10 },   // 워밍업
        { duration: '2m', target: 100 },  // 부하 증가 1
        { duration: '2m', target: 200 },  // 부하 증가 2
        { duration: '2m', target: 300 },  // 부하 증가 3
        { duration: '2m', target: 400 },  // 부하 증가 4 (이 지점 어딘가에서 한계 도달 예상)
        { duration: '1m', target: 0 },    // 쿨다운
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // 에러율이 1%를 초과하면 버티지 못한 것으로 간주
    },
};

// 환경 변수 기반 유연한 BASE_URL 처리 (기본값 localhost)
// 실행 예시: k6 run -e BASE_URL=http://54.252.83.173:8080 stress_test.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const MAX_RECORD_ID = 10000; // DB 더미 데이터 최대치에 맞게 조절하세요

export function setup() {
    const res = http.post(`${BASE_URL}/api/users/login`, JSON.stringify({ email: 'user1@test.com', password: 'password123' }), {
        headers: { 'Content-Type': 'application/json' }
    });
    return { cookies: res.cookies };
}

export default function (data) {
    const randomId = Math.floor(Math.random() * MAX_RECORD_ID) + 1;
    const randomAction = Math.random();
    
    let res;

    if (randomAction < 0.7) {
        res = http.get(`${BASE_URL}/api/posts/${randomId}`, { cookies: data.cookies });
        check(res, { 'Post Status 200': (r) => r.status === 200 });
    } 
    else if (randomAction < 0.9) {
        res = http.get(`${BASE_URL}/api/users/${randomId}`, { cookies: data.cookies });
        check(res, { 'User Profile Status 200': (r) => r.status === 200 });
    } 
    else {
        res = http.get(`${BASE_URL}/api/series/${randomId}`, { cookies: data.cookies });
        check(res, { 'Series Status 200': (r) => r.status === 200 });
    }

    // 스트레스 테스트는 한계를 찾는 것이 목적이므로 sleep(대기 시간)이 없습니다.
}
