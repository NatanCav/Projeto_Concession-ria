import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bike,
  Car,
  FileCheck2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { useFeaturedVehicles, useRecentVehicles } from "@/hooks/useVehicles";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useSettings } from "@/hooks/useSettings";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { CatalogGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { buildGenericWhatsappUrl } from "@/utils/whatsapp";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { VehicleType } from "@/types/vehicle";

const vehicleTypeShortcuts: { type: VehicleType; label: string; icon: typeof Car }[] = [
  { type: "CARRO", label: "Carros", icon: Car },
  { type: "MOTO", label: "Motos", icon: Bike },
  { type: "CAMINHAO", label: "Caminhões", icon: Truck },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => CURRENT_YEAR - i);
const MAX_PRICE_OPTIONS = [50000, 100000, 150000, 200000, 300000];

export function Home() {
  useDocumentMeta({
    title: "Concessionária — Encontre seu próximo veículo",
    description: "Catálogo de veículos novos e seminovos com procedência garantida. Pesquise, filtre e fale pelo WhatsApp.",
  });

  const { data: settings } = useSettings();
  const { data: featured, isLoading: loadingFeatured } = useFeaturedVehicles(8);
  const { data: recent, isLoading: loadingRecent } = useRecentVehicles(8);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");

  const heroImage = featured?.find((v) => v.primaryImageUrl)?.primaryImageUrl ?? recent?.find((v) => v.primaryImageUrl)?.primaryImageUrl;

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (searchBrand) params.set("brandId", searchBrand);
    if (searchYear) {
      params.set("minYear", searchYear);
      params.set("maxYear", searchYear);
    }
    if (searchMaxPrice) params.set("maxPrice", searchMaxPrice);
    navigate(params.toString() ? `/veiculos?${params.toString()}` : "/veiculos");
  };

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Procedência verificada",
      description: "Veículos revisados e com histórico checado antes de entrar no catálogo.",
    },
    {
      icon: SlidersHorizontal,
      title: "Busca por filtros",
      description: "Filtre por marca, ano, preço e quilometragem para achar a opção certa.",
    },
    {
      icon: FileCheck2,
      title: "Ficha técnica completa",
      description: "Consulte especificações detalhadas de cada veículo antes de decidir.",
    },
    {
      icon: MessageCircle,
      title: "Contato direto",
      description: settings?.whatsapp
        ? "Fale com a equipe pelo WhatsApp direto na página do veículo."
        : "Fale com a equipe para tirar dúvidas sobre qualquer veículo.",
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
          </>
        )}

        <div className="container-page relative flex flex-col gap-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">
              Seu próximo carro está aqui
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Encontre seu <span className="text-brand-500">próximo veículo</span>
            </h1>
            <p className="mt-4 max-w-lg text-ink-300">
              Confira nosso estoque de veículos revisados e encontre a melhor oportunidade para você.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {vehicleTypeShortcuts.map(({ type, label, icon: Icon }) => (
                <Link
                  key={type}
                  to={`/veiculos?vehicleType=${type}`}
                  className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/60 px-4 py-2 text-sm font-medium text-ink-200 backdrop-blur hover:border-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-10 sm:-mt-14">
        <form
          onSubmit={handleAdvancedSearch}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-popover sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end"
        >
          <Select label="Marca" value={searchBrand} onChange={(e) => setSearchBrand(e.target.value)}>
            <option value="">Todas as marcas</option>
            {brands?.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
          <Input
            label="Modelo ou versão"
            placeholder="Ex.: Corolla, Civic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select label="Ano" value={searchYear} onChange={(e) => setSearchYear(e.target.value)}>
            <option value="">Todos os anos</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select label="Preço até" value={searchMaxPrice} onChange={(e) => setSearchMaxPrice(e.target.value)}>
            <option value="">Qualquer valor</option>
            {MAX_PRICE_OPTIONS.map((price) => (
              <option key={price} value={price}>
                R$ {price.toLocaleString("pt-BR")}
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            <Search className="h-4 w-4" /> Buscar
          </button>
        </form>
      </div>

      <section className="border-b border-ink-100 bg-white py-14">
        <div className="container-page grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-ink-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Destaques</p>
            <h2 className="mt-1 text-2xl font-bold text-ink-900">Veículos em destaque</h2>
          </div>
          <Link
            to="/veiculos"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            Ver todos os veículos →
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
          <div className="container-page">
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

      <section className="container-page py-14">
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

      {settings?.description && (
        <section className="bg-ink-950 py-16 text-white">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Sobre nós</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Sobre {settings.dealershipName ? `a ${settings.dealershipName}` : "nós"}
              </h2>
              <p className="mt-4 text-ink-300">{settings.description}</p>
              {settings.whatsapp && (
                <a
                  href={buildGenericWhatsappUrl(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-900 transition-colors hover:bg-ink-100"
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
              )}
            </div>
          </div>

          {(settings.city || settings.address) && (
            <div className="container-page mt-10 border-t border-ink-800 pt-6">
              <p className="flex items-center gap-2 text-sm text-ink-300">
                <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                Estamos em {settings.city}
                {settings.state ? `/${settings.state}` : ""}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="bg-brand-500">
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center text-white">
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
