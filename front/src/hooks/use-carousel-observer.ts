import { useState, useEffect, RefObject } from 'react';

/**
 * 렌더링 낭비 없는(Jank-free) 캐러셀 스크롤 화살표 가시성 감시 훅
 * @param containerRef 스크롤이 발생하는 컨테이너 (flex overflow-x-auto)
 * @param dependencies 데이터 배열 등, DOM 갱신 시 옵저버를 재연결하기 위한 의존성 배열
 */
export function useCarouselObserver(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: unknown[] = []
) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // container 내부의 양 끝에 심어둔 투명 더미 박스를 찾습니다.
    const leftDummy = container.querySelector('[data-carousel-dummy="left"]');
    const rightDummy = container.querySelector('[data-carousel-dummy="right"]');

    if (!leftDummy || !rightDummy) {
      // 더미가 없거나(데이터 0개) 아직 렌더링 전이라면 화살표를 숨깁니다.
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isLeft = entry.target.getAttribute('data-carousel-dummy') === 'left';
          
          if (isLeft) {
            // 왼쪽 더미가 화면(root)에 1px이라도 보이면 왼쪽 화살표를 숨김 (!isIntersecting)
            setShowLeft(!entry.isIntersecting);
          } else {
            // 오른쪽 더미가 화면(root)에 1px이라도 보이면 오른쪽 화살표를 숨김 (!isIntersecting)
            setShowRight(!entry.isIntersecting);
          }
        });
      },
      {
        root: container, // 기준을 브라우저 뷰포트가 아닌 가로 스크롤 컨테이너로 설정
        rootMargin: "0px",
        threshold: 0, // 단 1픽셀이라도 교차하면 이벤트 발생
      }
    );

    observer.observe(leftDummy);
    observer.observe(rightDummy);

    return () => {
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...dependencies]);

  return { showLeft, showRight };
}
