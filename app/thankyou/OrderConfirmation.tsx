// components/OrderConfirmation.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function OrderConfirmation() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(searchParams.get('orderId'));
  const total = searchParams.get('total');
  const items = searchParams.get('items');
  const shippingAddress = searchParams.get('shippingAddress');
  const tax = searchParams.get('tax');
  const tip = searchParams.get('tip');

  const router = useRouter();

  const handleDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      irADashboard(router);
    }, 2000); // Simulate a delay of 2 seconds
  };

  const [orderItems, setOrderItems] = useState<{ id: string; price: number; quantity: number; name: string; image: string; color?: string; size?: string; sizeRange?: string }[]>([]);
  const [address, setAddress] = useState<{ address: string; city: string; state: string } | null>(null);

  useEffect(() => {
    if (items) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(items));
        setOrderItems(parsedItems);
      } catch (err) {
        console.error('Error parsing items:', err);
      }
    }

    if (shippingAddress) {
      try {
        const parsedAddress = JSON.parse(decodeURIComponent(shippingAddress));
        setAddress(parsedAddress);
      } catch (err) {
        console.error('Error parsing shipping address:', err);
      }
    }
  }, [items, shippingAddress]);

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  useEffect(() => {
    const fetchOrderId = async () => {
      if (!session?.user?.id) return;
  
      try {
        const res = await fetch(`/api/orders?userId=${session.user.id}`);
        const data = await res.json();
  
        if (res.ok) {
          setOrderId(data.id);
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("Error al obtener la orden:", err);
      }
    };
  
    fetchOrderId();
  }, [session]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Confirmación N°{orderId || orderItems[0]?.id}</h1>
        <p className="text-xl">¡Gracias, {session?.user?.name}!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Tu pedido está confirmado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Recibirás en breve un correo electrónico de confirmación con tu número de pedido.
              </p>

              <div className="rounded-md overflow-hidden border border-gray-200 mt-4">
                <div className="bg-gray-100 p-2 text-sm text-gray-600">
                  <span className="font-medium">Ubicación de entrega:</span> {session?.user?.address ? `${session?.user?.address}, ${session?.user?.city}, ${session?.user?.state}` : 'No disponible'}
                </div>
                <div className="relative w-full h-48">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63123.96036467518!2d-72.53976233991576!3d7.889361541622373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e66459c645dd28b%3A0x26736c1ff4db5caa!2sC%C3%BAcuta%2C%20Norte%20de%20Santander%2C%20Colombia!5e0!3m2!1sen!2sus!4v1744663838510!5m2!1sen!2sus`}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4">Detalles del pedido</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Información de contacto</h3>
              <p>{session?.user?.name}</p>
              <p>{session?.user?.lastname}</p>
              <p>{session?.user?.address}</p>
              <p>{session?.user?.email}</p>
              <p>{session?.user?.phone || 'Sin número de teléfono'}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Dirección de envío</h3>
              <div className="space-y-1">
                <p>{session?.user?.address}</p>
                <p>{session?.user?.house_apt}</p>
                <p>{session?.user?.city}</p>
                <p>{session?.user.state}</p>
                <p>{session?.user.postal_code}</p>
                <p>{session?.user.phone || 'Sin número de teléfono'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Método de envío</h3>
              <p>Standard</p>
            </div>

            <Separator />

            <div className="mt-8">
              <p className="font-medium">
                ¿Necesitas ayuda?{' '}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Ponte en contacto con nosotros
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Purchased Items */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Artículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="border-b pb-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Cantidad</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div className="w-24 h-24 shrink-0 rounded-md border overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} c/u
                          {item.color && <span> - Color: {item.color}</span>}
                          {item.size && <span> - Talla: {item.size}</span>}
                          {item.sizeRange && <span> - Talla: {item.sizeRange}</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <h3 className="font-bold text-lg mb-4">Resumen de costos</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Impuestos (19%)</span>
                      <span>${tax}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Propina</span>
                      <span>${tip}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>Gratis</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg mt-4" disabled={loading} onClick={handleDashboard}>
              {loading ? 'Procesando...' : 'Ir a Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function irADashboard(router: ReturnType<typeof useRouter>) {
  // Implement the navigation to the dashboard
  router.push('/dashboard');
}
