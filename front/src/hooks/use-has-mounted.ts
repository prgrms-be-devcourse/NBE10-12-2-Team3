"use client";

import { useEffect, useState } from "react";

// 서버는 로그인 여부를 알 수 없어 항상 초기값(비로그인)으로 렌더링하는데, 클라이언트가
// 하이드레이션 이전부터 useAuth()의 실제 isLoggedIn/user 값으로 다른 구조를 그리면
// "Hydration failed" 에러가 납니다. 마운트가 끝난 뒤에만 true가 되므로, 이 값으로
// 인증 의존 UI를 감싸면 서버와 동일한 화면을 먼저 보여준 뒤 정상적으로 갱신됩니다.
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}
