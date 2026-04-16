import type { Metadata } from "next";
import Stripe from "stripe";

export const metadata: Metadata = { title: "Admin · Precios" };

function eur(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// Página de gestión de precios y productos de Stripe
export default async function AdminPreciosPage() {
  let productos: Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    precios: Array<{
      id: string;
      precio: number;
      intervalo: string | null;
      activo: boolean;
      creado: string;
    }>;
  }> = [];

  let errorStripe: string | null = null;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

    const [productosStripe, preciosStripe] = await Promise.all([
      stripe.products.list({ limit: 20, active: true }),
      stripe.prices.list({ limit: 50, expand: ["data.product"] }),
    ]);

    productos = productosStripe.data.map((prod) => {
      const preciosDelProducto = preciosStripe.data
        .filter((p) => {
          const pid = typeof p.product === "string" ? p.product : p.product?.id;
          return pid === prod.id;
        })
        .map((p) => ({
          id: p.id,
          precio: p.unit_amount ?? 0,
          intervalo: p.recurring?.interval ?? null,
          activo: p.active,
          creado: new Date(p.created * 1000).toLocaleDateString("es-ES"),
        }))
        .sort((a, b) => a.precio - b.precio);

      return {
        id: prod.id,
        nombre: prod.name,
        descripcion: prod.description,
        activo: prod.active,
        precios: preciosDelProducto,
      };
    });
  } catch (err) {
    errorStripe = err instanceof Error ? err.message : "Error al conectar con Stripe";
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Precios</h1>
      <p className="mb-6 text-sm text-gray-500">
        Productos y precios configurados en Stripe. Para modificarlos, usa el{" "}
        <a
          href="https://dashboard.stripe.com/products"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
        >
          Dashboard de Stripe →
        </a>
      </p>

      {errorStripe ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          Error al cargar precios: {errorStripe}
        </div>
      ) : productos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          No hay productos activos en Stripe
        </div>
      ) : (
        <div className="space-y-4">
          {productos.map((prod) => (
            <div key={prod.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Cabecera del producto */}
              <div className="flex items-start justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="font-semibold text-gray-900">{prod.nombre}</h2>
                  {prod.descripcion && (
                    <p className="mt-0.5 text-sm text-gray-500">{prod.descripcion}</p>
                  )}
                  <p className="mt-1 font-mono text-xs text-gray-400">{prod.id}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    prod.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {prod.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Precios del producto */}
              {prod.precios.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-5 py-2.5 text-left">Price ID</th>
                      <th className="px-5 py-2.5 text-center">Precio</th>
                      <th className="px-5 py-2.5 text-center">Intervalo</th>
                      <th className="px-5 py-2.5 text-center">Estado</th>
                      <th className="px-5 py-2.5 text-center">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prod.precios.map((precio) => (
                      <tr key={precio.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{precio.id}</td>
                        <td className="px-5 py-3 text-center font-semibold text-gray-900">
                          {eur(precio.precio)}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-600 capitalize">
                          {precio.intervalo ?? "único"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              precio.activo
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {precio.activo ? "Activo" : "Archivado"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-xs text-gray-400">
                          {precio.creado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-4 text-sm text-gray-400">Sin precios configurados</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo cambiar un precio?</p>
        <ol className="space-y-1.5 text-sm text-gray-500 list-decimal list-inside">
          <li>Ve al Dashboard de Stripe → Productos</li>
          <li>Archiva el precio actual y crea uno nuevo con el importe deseado</li>
          <li>Copia el nuevo Price ID (<span className="font-mono text-xs">price_xxx</span>)</li>
          <li>Actualiza la variable de entorno <span className="font-mono text-xs">STRIPE_PRICE_ID</span> en Vercel con el nuevo ID</li>
          <li>Redeploy para que el cambio surta efecto</li>
        </ol>
      </div>
    </div>
  );
}
