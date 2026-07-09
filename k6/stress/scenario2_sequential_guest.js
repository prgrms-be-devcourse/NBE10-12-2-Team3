import http from 'k6/http';
import { check } from 'k6';

/**
 * [스트레스 시나리오 2: 1~100번 게시글 순차 타격 (비로그인)]
 * 내용: 400명의 비로그인 유저가 대기 시간 없이 1~100번 게시글을 미친 듯이 순회 조회
 * 목적: DB 디스크 한계점 돌파 시나리오. 순수 DB I/O Wait 및 네트워크 대역폭 마비 시점 파악
 */
export const options = {
    stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
    },
};

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' k6/stress/scenario2_sequential_guest.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
    // 순차 조회: 1번부터 100번까지 차례대로 순회
    const targetPostId = (__ITER % 100) + 1;

    // 비로그인 상태로 조회 (대기 시간 없음)
    const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`);
    
    check(res, {
        'Read Status 200': (r) => r.status === 200,
    });
}
