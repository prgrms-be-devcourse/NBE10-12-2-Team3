/**
 * 시나리오 A — 한 사람이 같은 게시글 반복 좋아요/취소 (스트레스)
 * 목적: 같은 행에 반복 락이 걸릴 때 DB 처리 한계 탐색
 *
 * [선택 이유]
 *   성능 테스트와 달리 한계점을 찾는 게 목적이므로 thresholds를 두지 않음
 *   단일 유저로 고정한 이유: 같은 post_id + user_id row에 반복 락을 집중시켜
 *   DB가 어느 VU 수부터 병목을 일으키는지 명확하게 탐색하기 위함
 *   10 → 400 VU 단계적 증가로 병목 발생 시점을 Grafana에서 관측
 *
 * 실행 방법:
 *   k6 run -e BASE_URL=https://api.scommit.store like-scenario1_repeat_toggle.js
 *
 * [사전 준비]
 *   DB에 아래 테스트 계정이 등록되어 있어야 함
 *   setup()에서 자동으로 로그인하여 토큰을 발급받음
 */

import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api.scommit.store';
const POST_ID = '52';

// 단일 테스트 계정 — 동일 유저가 반복 토글하는 상황 재현
const TEST_ACCOUNT = { email: 'user1@test.com', password: '123456' };

// setup()을 사용하는 이유:
// default function은 VU 수만큼 병렬로 실행되므로 각 VU가 로그인하면 400번 로그인 요청이 발생함
// setup()은 테스트 시작 전 단 1번만 실행되므로 불필요한 로그인 부하를 줄이기 위해 사용
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/users/login`,
    JSON.stringify(TEST_ACCOUNT),
    { headers: { 'Content-Type': 'application/json' } },
  );

  // 토큰은 응답 쿠키로 내려옴
  if (!res.cookies.accessToken || res.cookies.accessToken.length === 0) {
    throw new Error(`로그인 실패: ${TEST_ACCOUNT.email} / status: ${res.status}`);
  }
  return { token: res.cookies.accessToken[0].value };
}

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // 워밍업
    { duration: '2m', target: 100 },  // 부하 증가 1
    { duration: '2m', target: 200 },  // 부하 증가 2
    { duration: '2m', target: 300 },  // 부하 증가 3
    { duration: '2m', target: 400 },  // 부하 증가 4: DB Connection Pool 고갈 여부 확인
    { duration: '1m', target: 0 },    // 쿨다운
  ],
  // 스트레스 테스트는 한계 탐색이 목적 — 통과/실패 기준 없음
};

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${data.token}`,
  };

  // sleep을 넣지 않는 이유:
  // 스트레스 테스트는 한계점 탐색이 목적이므로 대기 없이 연속 요청으로 가혹한 부하를 줌
  // 같은 post_id + user_id row에 반복 락이 걸려 DB 병목 발생 시점을 확인하기 위함

  // 좋아요: existsByPostIdAndUserId → save 순서로 같은 row 반복 접근
  const likeRes = http.post(`${BASE_URL}/api/posts/${POST_ID}/likes`, null, { headers });
  check(likeRes, {
    // 201: 좋아요 성공 / 400: 이미 좋아요 상태 — 둘 다 서버가 정상 처리한 것
    'like status ok': (r) => r.status === 201 || r.status === 400,
  });

  // 취소: findByPostIdAndUserId → delete 순서로 같은 row 반복 접근
  const cancelRes = http.del(`${BASE_URL}/api/posts/${POST_ID}/likes`, null, { headers });
  check(cancelRes, {
    // 200: 취소 성공 / 400: 좋아요가 없는 상태에서 취소 시도 — 둘 다 정상 처리
    'cancel status ok': (r) => r.status === 200 || r.status === 400,
  });
}
