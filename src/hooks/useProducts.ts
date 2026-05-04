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

const normalizeProduct = (id: string, data: Record<string, unknown>): Product => ({
  id,
  name: String(data.name ?? ""),
  category: String(data.category ?? "Produto"),
  description: String(data.description ?? ""),
  image: String(data.image ?? "/produto-cadeira-main.png"),
  price: Number(data.price ?? 0),
  oldPrice: data.oldPrice === undefined || data.oldPrice === null ? undefined : Number(data.oldPrice),
  sellerId: data.sellerId ? String(data.sellerId) : undefined,
  sellerName: data.sellerName ? String(data.sellerName) : undefined,
  city: data.city ? String(data.city) : undefined,
  state: data.state ? String(data.state) : undefined,
  stock: data.stock === undefined || data.stock === null ? undefined : Number(data.stock),
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

  return productId;
};

export const seedDefaultProducts = async (sellerId: string) => {
  await Promise.all(
    defaultProducts.map((product) =>
      setDoc(
        doc(firestore, "products", product.id),
        {
          ...product,
          sellerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    )
  );
};
