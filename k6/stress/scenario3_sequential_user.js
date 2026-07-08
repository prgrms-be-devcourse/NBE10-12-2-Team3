import http from "k6/http";
import { check } from "k6";

/**
 * [스트레스 시나리오 3: 1~100번 게시글 순차 타격 (로그인 유저)]
 * 내용: 400명의 로그인된 유저가 개인화 데이터(좋아요, 구독)를 포함해 대기 시간 없이 무한 반복 조회
 * 목적: 가장 무거운 복합 트래픽. Spring Security CPU 과부하 및 DB 커넥션 풀 완전 고갈(Deadlock/Timeout) 시점 파악
 */
export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 300 },
    { duration: "2m", target: 400 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

// 실행 예시: k6 run -e BASE_URL=http://'백엔드 도메인 주소' k6/stress/scenario3_sequential_user.js
const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

// [사전 준비] 테스트 시작 전 단 1번만 실행되어 로그인 수행
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/users/login`,
    JSON.stringify({ email: "user1@test.com", password: "123456" }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  return { cookies: res.cookies };
}

// [반복 부하] 대기 시간 없이 즉시 요청 반복
export default function (data) {
  // 순차 조회: 1번부터 100번까지 차례대로 순회
  const targetPostId = (__ITER % 100) + 1;

  // 로그인 토큰 장착
  const reqOptions = { cookies: data.cookies };

  // 로그인 상태로 조회
  const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`, reqOptions);

  check(res, {
    "Read Status 200": (r) => r.status === 200,
  });
}
