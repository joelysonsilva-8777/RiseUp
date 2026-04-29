const categories = [
  "Carros, Motos e outros",
  "Celulares e Telefones",
  "Calçados, Roupas e Bolsas",
  "Imóveis",
  "Ferramentas",
  "Agro",
  "Alimentos e Bebidas",
  "Arte, Papelaria e Armarinho",
  "Casa, Móveis e Decoração",
  "Informática",
  "Esportes e Fitness",
  "Beleza e Cuidado Pessoal",
  "Eletrônicos, Áudio e Vídeo",
  "Antiguidades e Coleções",
  "Saúde",
];

const CategoriesSection = () => (
  <section className="mt-[78px] w-full bg-[#e8e8e8] pb-[53px] pt-[16px]" id="categorias">
    <div className="mx-auto w-[calc(100%-24px)] max-w-[1325px] sm:w-[calc(100%-70px)]">
      <h2 className="text-[20px] leading-[24px] text-[#071735] sm:text-[25px] sm:leading-[30px]">Categorias</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-x-[31px] sm:gap-y-[17px] lg:grid-cols-[minmax(220px,274px)_repeat(7,minmax(0,1fr))]">
        {categories.map((category, index) => (
          <article className={`min-w-0 ${index === 0 ? "lg:row-span-2" : ""}`} key={category}>
            <div
              className={
                index === 0
                  ? "h-[160px] rounded-[5px] bg-white sm:h-[239px]"
                  : "h-[104px] rounded-[5px] bg-white"
              }
            />
            <h3
              className={
                index === 0
                  ? "mt-[10px] break-words text-[13px] leading-[17px] text-[#071735] sm:text-[16px] sm:leading-[19px]"
                  : "mt-[9px] break-words text-[10px] leading-[12px] text-[#071735] sm:text-[11px] sm:leading-[13px]"
              }
            >
              {category}
            </h3>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;