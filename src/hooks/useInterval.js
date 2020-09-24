import { useEffect, useRef } from 'react';

export default function useInterval(func, interval) {
  const myRef = useRef(null);

  useEffect(() => {
    myRef.current = func;
  }, [func]);

  useEffect(() => {
    myRef.current();
    const timer = setInterval(() => {
      myRef.current();
    }, interval || 1000);
    return () => clearInterval(timer);
  }, [interval]);
}
