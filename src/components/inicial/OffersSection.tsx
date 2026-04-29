import { Link } from "react-router-dom";

type Product = {
  name: string;
  oldPrice?: string;
  price: string;
};

const products: Product[] = [
  { name: "Samsung Galaxy A5 - Branco", oldPrice: "R$ 750", price: "R$ 700" },
  { name: "Galaxy tap a11", price: "R$ 850" },
  { name: "iPhone 17 Pro Max 512GB - LACRADO", price: "R$ 11.850" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
];

const topOffers = products.slice(0, 4);

const ProductCard = ({
  name,
  oldPrice,
  price,
}: {
  name: string;
  oldPrice?: string;
  price: string;
}) => (
  <article className="min-w-0">
    <Link className="block text-[#071735] no-underline" to="/produto">
      <div className="h-[168px] w-full rounded-[5px] bg-white" />
      <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">
        {name}
      </h3>
    </Link>
    <div className="mt-4 min-h-[39px]">
      {oldPrice ? (
        <p className="text-[13px] leading-[15px] text-[#8493ad]">{oldPrice}</p>
      ) : null}
      <p className="text-[19px] leading-[24px] text-[#071735]">{price}</p>
    </div>
    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] leading-[14px] text-[#0b1020]">
      <span>Hoje, 16:46</span>
      <span>Paulista - PE</span>
    </p>
  </article>
);

const OffersSection = () => (
  <section
    className="mx-auto mt-[23px] grid w-[calc(100%-70px)] max-w-[1312px] grid-cols-[minmax(320px,428px)_minmax(0,1fr)] gap-[62px]"
    id="ofertas"
  >
    <article className="h-[438px] overflow-hidden rounded-[10px] bg-white px-[31px] pt-[20px]">
      <h1 className="text-[33px] leading-[40px] text-[#071735]">Oferta do dia</h1>
      <div className="mx-auto mt-4 h-[211px] w-[243px] rounded-[5px] bg-[#d9d9d9]" />
      <h2 className="mt-[13px] text-[21px] leading-[26px] text-[#071735]">
        Samsung Galaxy A5 - Branco
      </h2>
      <p className="mt-[18px] text-[17px] leading-[20px] text-[#8493ad]">R$ 750</p>
      <p className="text-[32px] leading-[38px] text-[#071735]">R$ 700</p>
      <p className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1 text-[21px] leading-[25px] text-[#0b1020]">
        <span>Hoje, 16:46</span>
        <span>Paulista - PE</span>
      </p>
    </article>

    <div className="pt-[20px]">
      <div className="mb-[16px] flex items-center gap-[50px]">
        <h2 className="text-[21px] leading-[25px] text-[#071735]">Ofertas</h2>
        <a className="text-[11px] leading-[14px] text-[#4188f7]" href="#ofertas">
          mostrar todas as ofertas
        </a>
      </div>
      <div className="grid grid-cols-4 gap-x-[31px]">
        {topOffers.map((product, index) => (
          <ProductCard key={`top-${index}`} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default OffersSection;