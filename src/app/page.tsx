import { redirect } from 'next/navigation';

// ============================================
// NEXUSOS - REDIRECCIÓN A PORTAL DE VENTAS
// ============================================
// El dominio principal (/) redirige automáticamente al portal de ventas
// El portal es la página pública que:
// - Vende y explica cada industria
// - Muestra precios personalizados por industria
// - Lleva al cliente al formulario y pago
// - Para clientes, ahí termina su recorrido

export default function Home() {
  redirect('/portal');
}
