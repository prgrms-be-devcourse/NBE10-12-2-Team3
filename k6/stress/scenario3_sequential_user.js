import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

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

const users = new SharedArray("users", function () {
  return JSON.parse(open("../users.json"));
});

// [사전 준비] 테스트 시작 전 단 1번만 실행되어 다수의 유저 로그인 수행
export function setup() {
  const cookiesList = [];
  
  for (let i = 0; i < users.length; i++) {
    const res = http.post(
      `${BASE_URL}/api/users/login`,
      JSON.stringify(users[i]),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    cookiesList.push(res.cookies);
  }
  
  return { cookiesList };
}

// [반복 부하] 대기 시간 없이 즉시 요청 반복
export default function (data) {
  // 순차 조회: 1번부터 100번까지 차례대로 순회
  const targetPostId = (__ITER % 100) + 1;

  // VU별로 고유한 유저 쿠키 할당 (데이터 수가 부족하면 다시 처음부터 순환)
  // __VU는 1부터 시작하므로 -1 처리
  const userIndex = (__VU - 1) % data.cookiesList.length;
  const reqOptions = { cookies: data.cookiesList[userIndex] };

  // 로그인 상태로 조회
  const res = http.get(`${BASE_URL}/api/posts/${targetPostId}`, reqOptions);

  check(res, {
    "Read Status 200": (r) => r.status === 200,
  });
}
