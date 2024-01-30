import { useEffect, useRef } from "react";

export function usePrevious(value: boolean) {
  const ref = useRef<boolean | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
