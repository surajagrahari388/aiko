"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ParticlesProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  animate?: boolean;
  asChild?: boolean;
};

type ParticlesEffectProps = React.HTMLAttributes<HTMLDivElement> & {
  "data-variant"?: string;
};

function Particles({
  children,
  animate = false,
  asChild = false,
  className,
  ...props
}: ParticlesProps) {
  if (asChild && React.isValidElement(children)) {
    const childProps = {
      ...(typeof children.props === "object" && children.props !== null
        ? children.props
        : {}),
      "data-particles": animate ? "true" : "false",
      ...props,
    };

    return React.cloneElement(children, childProps);
  }

  return (
    <div
      className={cn("relative", className)}
      data-particles={animate ? "true" : "false"}
      {...props}
    >
      {children}
    </div>
  );
}

function ParticlesEffect({
  className,
  "data-variant": variant,
  ...props
}: ParticlesEffectProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        '[&[data-particles="true"]]:animate-pulse',
        className
      )}
      data-variant={variant}
      {...props}
    >
      {/* Particle effect elements can be added here */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 [data-particles='true']:opacity-100">
        {/* Simple particle effect simulation */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full bg-current opacity-0",
              "animate-ping",
              className
            )}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: "600ms",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export {
  Particles,
  ParticlesEffect,
  type ParticlesProps,
  type ParticlesEffectProps,
};
