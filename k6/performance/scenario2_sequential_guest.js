import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * [시나리오 2: 1~100번 게시글 순차 조회 (비로그인)]
 * 내용: 100명의 비로그인 유저가 다양한 미디어가 섞인 1~100번 게시글을 순차적으로 조회
 * 목적: DB가 디스크에서 데이터를 무작위로 가져올 때의 순수 DB 읽기 성능(I/O) 및 네트워크 페이로드 부하 측정
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

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' k6/performance/scenario2_sequential_guest.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
    // 순차 조회: 1번부터 100번까지 차례대로 순회 (100번 이후엔 다시 1번으로)
    const targetPostId = (__ITER % 100) + 1;

    // 비로그인 상태로 조회
    const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`);
    
    check(res, {
        'Read Status 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 1.5 + 0.5); 
}
