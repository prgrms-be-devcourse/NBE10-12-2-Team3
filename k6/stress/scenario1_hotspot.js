import http from 'k6/http';
import { check } from 'k6';

/**
 * [스트레스 시나리오 1: 핫스팟 집중 타격 (비로그인)]
 * 내용: 대기 시간(sleep) 없이 무자비하게 1개의 인기 게시물을 400명까지 늘려가며 동시 타격
 * 목적: 순수 웹 서버(Tomcat) 스레드가 터지는 한계점(Breaking Point) 및 에러 발생 시점 파악
 */
export const options = {
    // 극한의 트래픽을 밀어넣는 스트레스 테스트 부하 모델
    stages: [
        { duration: '1m', target: 10 },   // 워밍업
        { duration: '2m', target: 100 },  // 부하 증가 1
        { duration: '2m', target: 200 },  // 부하 증가 2
        { duration: '2m', target: 300 },  // 부하 증가 3
        { duration: '2m', target: 400 },  // 부하 증가 4 (한계 도달 탐색)
        { duration: '1m', target: 0 },    // 쿨다운
    ],
    thresholds: {
        // 스트레스 테스트는 한계점을 찾는 것이므로 응답시간(p95) 기준은 뺍니다.
        http_req_failed: ['rate<0.01'],   // 에러율이 1% 초과 시 테스트 강제 종료(Fail)
    },
};

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' -e TARGET_POST_ID=1 k6/stress/scenario1_hotspot.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
    // 핫스팟: 환경변수로 넘긴 ID를 찌르거나, 입력이 없으면 기본값 1번 고정 타격
    const targetPostId = __ENV.TARGET_POST_ID || 1; 

    // 비로그인 상태로 조회 (대기 시간 없이 즉시 다음 루프 실행)
    const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`);
    
    check(res, {
        'Read Status 200': (r) => r.status === 200,
    });
}
