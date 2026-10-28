"use client";

import { Navii } from "@usenavii/react";
import { Avatar } from "@/shared/ui/avatar";

export const avatarSeeds = Array.from(
  { length: 12 },
  (_, index) => `papyrbound-reader-${String(index + 1).padStart(2, "0")}`,
);

export function ReaderAvatar({
  seed,
  size = 32,
}: {
  seed: string;
  size?: number;
}) {
  return (
    <Avatar
      className="overflow-hidden bg-muted"
      style={{ width: size, height: size }}
    >
      <Navii
        seed={seed}
        size={size}
        as="img"
        animated={false}
        title="Reader avatar"
      />
    </Avatar>
  );
}
