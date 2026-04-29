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
    <div className="mx-auto w-[calc(100%-70px)] max-w-[1325px]">
      <h2 className="text-[25px] leading-[30px] text-[#071735]">Categorias</h2>
      <div className="mt-3 grid grid-cols-[minmax(220px,274px)_repeat(7,minmax(0,1fr))] gap-x-[31px] gap-y-[17px]">
        {categories.map((category, index) => (
          <article className={`min-w-0 ${index === 0 ? "row-span-2" : ""}`} key={category}>
            <div
              className={
                index === 0
                  ? "h-[239px] rounded-[5px] bg-white"
                  : "h-[104px] rounded-[5px] bg-white"
              }
            />
            <h3
              className={
                index === 0
                  ? "mt-[10px] break-words text-[16px] leading-[19px] text-[#071735]"
                  : "mt-[9px] break-words text-[11px] leading-[13px] text-[#071735]"
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