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
    <div className="h-[168px] w-full rounded-[5px] bg-white" />
    <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">{name}</h3>
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

type ProductsSectionProps = {
  className?: string;
};

const ProductsSection = ({ className = "mt-[70px]" }: ProductsSectionProps) => (
  <section className={`mx-auto w-[calc(100%-70px)] max-w-[1312px] px-0 ${className}`}>
    <h2 className="text-[23px] leading-[28px] text-[#071735]">
      Baixaram de preço em Eletrônicos e celulares
    </h2>
    <div className="mt-4 grid grid-cols-6 gap-x-[31px]">
      {products.map((product, index) => (
        <ProductCard key={`${product.name}-${index}`} {...product} />
      ))}
    </div>
  </section>
);

export default ProductsSection;