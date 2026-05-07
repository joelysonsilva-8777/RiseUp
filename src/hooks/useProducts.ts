import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import {
  defaultProducts,
  filterProducts,
  slugifyProductName,
  type Product,
  type ProductInput,
} from "../data/products";

const productsCollection = collection(firestore, "products");

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const toAttributes = (value: unknown): Record<string, string | string[]> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string | string[]>>(
    (attributes, [key, attributeValue]) => {
      if (typeof attributeValue === "string") {
        attributes[key] = attributeValue;
      } else if (Array.isArray(attributeValue)) {
        attributes[key] = attributeValue.filter((item): item is string => typeof item === "string");
      }

      return attributes;
    },
    {}
  );
};

const normalizeProduct = (id: string, data: Record<string, unknown>): Product => ({
  id,
  name: String(data.name ?? ""),
  category: String(data.category ?? "Produto"),
  listingGroup: data.listingGroup as Product["listingGroup"],
  searchTerm: data.searchTerm ? String(data.searchTerm) : undefined,
  description: String(data.description ?? ""),
  image: String(data.image ?? "/produto-cadeira-main.png"),
  images: toStringArray(data.images),
  price: Number(data.price ?? 0),
  oldPrice: data.oldPrice === undefined || data.oldPrice === null ? undefined : Number(data.oldPrice),
  sellerId: data.sellerId ? String(data.sellerId) : undefined,
  sellerName: data.sellerName ? String(data.sellerName) : undefined,
  sellerPhotoURL: data.sellerPhotoURL ? String(data.sellerPhotoURL) : undefined,
  sellerCity: data.sellerCity ? String(data.sellerCity) : undefined,
  sellerState: data.sellerState ? String(data.sellerState) : undefined,
  city: data.city ? String(data.city) : undefined,
  state: data.state ? String(data.state) : undefined,
  stock: data.stock === undefined || data.stock === null ? undefined : Number(data.stock),
  sku: data.sku ? String(data.sku) : undefined,
  condition: data.condition as Product["condition"],
  attributes: toAttributes(data.attributes),
  tags: toStringArray(data.tags),
  catalogCode: data.catalogCode ? String(data.catalogCode) : undefined,
  featured: Boolean(data.featured),
  createdAt: data.createdAt as Product["createdAt"],
  updatedAt: data.updatedAt as Product["updatedAt"],
});

export const useProducts = (query = "") => {
  const [firebaseProducts, setFirebaseProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        const nextProducts = snapshot.docs
          .map((productDoc) => normalizeProduct(productDoc.id, productDoc.data()))
          .filter((product) => product.name && product.price > 0)
          .sort((first, second) => {
            const firstTime = first.createdAt?.toMillis?.() ?? 0;
            const secondTime = second.createdAt?.toMillis?.() ?? 0;
            return secondTime - firstTime;
          });

        setFirebaseProducts(nextProducts);
        setUsingFallback(nextProducts.length === 0);
        setLoading(false);
      },
      () => {
        setFirebaseProducts([]);
        setUsingFallback(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const products = firebaseProducts.length > 0 ? firebaseProducts : defaultProducts;
  const filteredProducts = useMemo(() => filterProducts(products, query), [products, query]);

  return {
    products,
    filteredProducts,
    loading,
    usingFallback,
  };
};

export const getProductById = async (productId: string) => {
  const snapshot = await getDocs(productsCollection);
  const firebaseProduct = snapshot.docs
    .map((productDoc) => normalizeProduct(productDoc.id, productDoc.data()))
    .find((product) => product.id === productId);

  return firebaseProduct ?? defaultProducts.find((product) => product.id === productId) ?? null;
};

export const saveProduct = async (input: ProductInput, preferredId?: string) => {
  const productId = preferredId || `${slugifyProductName(input.name)}-${Date.now()}`;

  await setDoc(doc(firestore, "products", productId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (input.sellerId) {
    await setDoc(
      doc(firestore, "sellerProfiles", input.sellerId),
      {
        city: input.sellerCity ?? input.city ?? "",
        displayName: input.sellerName ?? "Vendedor Acesse+",
        photoURL: input.sellerPhotoURL ?? "",
        sellerId: input.sellerId,
        state: input.sellerState ?? input.state ?? "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return productId;
};

export const seedDefaultProducts = async (sellerId: string) => {
  await Promise.all([
    setDoc(
      doc(firestore, "sellerProfiles", sellerId),
      {
        city: "Paulista",
        displayName: "Acesse+ Labs",
        photoURL: "",
        sellerId,
        state: "PE",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    ...defaultProducts.map((product) =>
      setDoc(
        doc(firestore, "products", product.id),
        {
          ...product,
          sellerCity: product.city,
          sellerId,
          sellerState: product.state,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    ),
  ]);
};
