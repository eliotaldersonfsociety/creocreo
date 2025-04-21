// app/thankyou/page.tsx
import React, { Suspense } from 'react';
import OrderConfirmation from "@/components/OrderConfirmation";

// Componente que maneja el suspense y la carga del componente cliente
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmation />
    </Suspense>
  );
}
