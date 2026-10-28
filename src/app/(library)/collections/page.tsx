import { CollectionsPage } from "@/features/collections/ui/collections-page";
import { Suspense } from "react";

export default function CollectionsRoute() {
  return (
    <Suspense fallback={null}>
      <CollectionsPage />
    </Suspense>
  );
}
