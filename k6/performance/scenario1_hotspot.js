import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * [시나리오 1: 핫스팟 집중 조회 (비로그인)]
 * 내용: 100명의 비로그인 유저가 1개의 특정 인기 게시물에 동시 접속
 * 목적: DB 캐시가 적용된 상태에서, 순수 웹 서버(Tomcat) 스레드와 네트워크의 한계 성능 검증
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

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' -e TARGET_POST_ID=1 k6/performance/scenario1_hotspot.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
    // 핫스팟: 환경변수로 넘긴 ID를 찌르거나, 입력이 없으면 기본값 1번 고정 타격
    const targetPostId = __ENV.TARGET_POST_ID || 1; 

    // 비로그인 상태로 조회
    const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`);
    
    check(res, {
        'Read Status 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 1.5 + 0.5); 
}
