import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bike, Car, Search, ShieldCheck, Truck } from "lucide-react";
import { useFeaturedVehicles, useRecentVehicles } from "@/hooks/useVehicles";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { CatalogGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { VehicleType } from "@/types/vehicle";

const vehicleTypeShortcuts: { type: VehicleType; label: string; icon: typeof Car }[] = [
  { type: "CARRO", label: "Carros", icon: Car },
  { type: "MOTO", label: "Motos", icon: Bike },
  { type: "CAMINHAO", label: "Caminhões", icon: Truck },
];

export function Home() {
  useDocumentMeta({
    title: "Concessionária — Encontre seu próximo veículo",
    description: "Catálogo de veículos novos e seminovos com procedência garantida. Pesquise, filtre e fale pelo WhatsApp.",
  });

  const { data: settings } = useSettings();
  const { data: featured, isLoading: loadingFeatured } = useFeaturedVehicles(8);
  const { data: recent, isLoading: loadingRecent } = useRecentVehicles(8);
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(searchTerm ? `/veiculos?q=${encodeURIComponent(searchTerm)}` : "/veiculos");
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:py-24 lg:px-8">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Encontre seu <span className="text-brand-500">próximo veículo</span>
            </h1>
            <p className="mt-4 max-w-lg text-ink-300">
              Confira nosso estoque de veículos revisados e encontre a melhor oportunidade para você.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Marca, modelo ou versão"
                  className="h-12 w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-4 text-sm text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Buscar
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              {vehicleTypeShortcuts.map(({ type, label, icon: Icon }) => (
                <Link
                  key={type}
                  to={`/veiculos?vehicleType=${type}`}
                  className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-200 hover:border-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center gap-4 text-center">
            <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-6">
              <ShieldCheck className="mx-auto h-8 w-8 text-brand-500" />
              <p className="mt-3 text-sm font-semibold">Procedência garantida</p>
              <p className="mt-1 text-xs text-ink-400">Veículos revisados e com histórico verificado</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink-900">Veículos em destaque</h2>
          <Link to="/veiculos" className="text-sm font-semibold text-brand-500 hover:underline">
            Ver todos →
          </Link>
        </div>
        {loadingFeatured ? (
          <CatalogGridSkeleton count={4} />
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum veículo em destaque no momento" />
        )}
      </section>

      {categories && categories.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-ink-900">Categorias</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/veiculos?categoryId=${category.id}`}
                  className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink-900">Recém-chegados</h2>
          <Link to="/veiculos?sort=recentes" className="text-sm font-semibold text-brand-500 hover:underline">
            Ver todos →
          </Link>
        </div>
        {loadingRecent ? (
          <CatalogGridSkeleton count={4} />
        ) : recent && recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum veículo cadastrado ainda" />
        )}
      </section>

      <section className="bg-brand-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-14 text-center text-white sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Não encontrou o que procurava?</h2>
          <p className="max-w-lg text-brand-50">
            Fale com {settings?.dealershipName ?? "nossa equipe"} pelo WhatsApp e receba ajuda para encontrar o
            veículo ideal.
          </p>
          <Link
            to="/veiculos"
            className="mt-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-600 hover:bg-brand-50"
          >
            Ver estoque completo
          </Link>
        </div>
      </section>
    </div>
  );
}
