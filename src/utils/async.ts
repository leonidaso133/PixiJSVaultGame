import gsap from "gsap";

export function delay(seconds: number) {
  return new Promise<void>((resolve) => {
    gsap.delayedCall(seconds, resolve);
  });
}
