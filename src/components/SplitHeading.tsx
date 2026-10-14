import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Adapted from React Bits SplitText. See docs/third-party.md for source/license.
export default function SplitHeading({ text, id }: { text: string; id: string }) {
  const visual = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    gsap.registerPlugin(SplitText);
    const media = gsap.matchMedia();
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (disposed) return;
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const element = visual.current;
        if (!element) return;
        let split: SplitText | undefined;
        let animation: gsap.core.Tween | undefined;
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            split = SplitText.create(element, {
              type: 'words',
              aria: 'none',
              wordsClass: 'split-word',
            });
            animation = gsap.fromTo(
              split.words,
              { y: 10 },
              {
                y: 0,
                duration: 0.35,
                stagger: 0.025,
                ease: 'power2.out',
                onComplete: () => split?.revert(),
              },
            );
            observer.disconnect();
          },
          { threshold: 0.5 },
        );
        observer.observe(element);
        return () => {
          observer.disconnect();
          animation?.kill();
          split?.revert();
        };
      });
    });
    return () => {
      disposed = true;
      media.revert();
    };
  }, [text]);
  return (
    <h2 id={id}>
      <span className="sr-only">{text}</span>
      <span ref={visual} aria-hidden="true">
        {text}
      </span>
    </h2>
  );
}
