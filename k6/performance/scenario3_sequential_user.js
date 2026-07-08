import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * [시나리오 3: 1~100번 게시글 순차 조회 (로그인 유저)]
 * 내용: 100명의 로그인된 유저가 1~100번 게시글을 조회하며 개인화 데이터(좋아요, 구독)를 함께 반환
 * 목적: 실제 서비스와 가장 유사한 환경에서 JWT 암호 해독 및 개인화 쿼리가 서버에 주는 최종 종합 부하 검증
 */
export const options = {
    stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' k6/performance/scenario3_sequential_user.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// [사전 준비] 테스트 시작 전 단 1번만 실행되어 로그인 수행
export function setup() {
    const res = http.post(`${BASE_URL}/api/users/login`, JSON.stringify({ email: 'user1@test.com', password: 'password123' }), {
        headers: { 'Content-Type': 'application/json' }
    });
    // 받아온 쿠키(JWT 토큰)를 반환하여 유저들에게 나누어 줌
    return { cookies: res.cookies };
}

// [반복 부하] setup()에서 넘겨준 data를 받아와서 사용
export default function (data) {
    // 순차 조회: 1번부터 100번까지 차례대로 순회
    const targetPostId = (__ITER % 100) + 1;

    // 로그인 토큰(쿠키) 장착
    const reqOptions = { cookies: data.cookies };

    // 로그인 상태로 조회
    const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`, reqOptions);
    
    check(res, {
        'Read Status 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 1.5 + 0.5); 
}
