'use client';

import {useState, useEffect, useRef} from 'react';
import dynamic from 'next/dynamic';
import Lottie from 'lottie-react';
import type {LottieRefCurrentProps} from 'lottie-react';

const DotLottiePlayer = dynamic(
  () =>
    import('@dotlottie/react-player').then(
      (mod) => mod.DotLottiePlayer,
    ),
  {ssr: false},
);

interface LottieAnimationProps {
  path: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}

export function LottieAnimation({
  path,
  className = 'w-40 h-40',
  loop = true,
  autoplay = true,
  speed = 0.6,
}: LottieAnimationProps) {
  const isDotLottie = path.endsWith('.lottie');

  if (isDotLottie) {
    return (
      <div className={className} style={{background: 'transparent'}}>
        <DotLottiePlayer
          src={path}
          loop={loop}
          autoplay={autoplay}
          speed={speed}
          background="transparent"
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
          }}
        />
      </div>
    );
  }

  return (
    <LottieJson
      path={path}
      className={className}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
    />
  );
}

function LottieJson({
  path,
  className,
  loop,
  autoplay,
  speed = 0.5,
}: LottieAnimationProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(
    null,
  );
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    fetch(path)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, [path]);

  useEffect(() => {
    if (lottieRef.current && speed) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (!data) return <div className={className} />;

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}
