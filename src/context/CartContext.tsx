import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { formatCurrency, type Product } from "../data/products";
import { useAuth } from "./AuthContext";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sellerName?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  formattedSubtotal: string;
  loading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const localStorageKey = "acesse-cart";

const getLocalCart = () => {
  try {
    const rawCart = window.localStorage.getItem(localStorageKey);
    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const setLocalCart = (items: CartItem[]) => {
  window.localStorage.setItem(localStorageKey, JSON.stringify(items));
};

const productToCartItem = (product: Product, quantity: number): CartItem => ({
  productId: product.id,
  name: product.name,
  image: product.image,
  price: product.price,
  quantity,
  sellerName: product.sellerName,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user) {
      setItems(getLocalCart());
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(firestore, "users", user.uid, "private", "cart"),
      (snapshot) => {
        const cartItems = snapshot.exists() ? ((snapshot.data().items ?? []) as CartItem[]) : [];
        setItems(cartItems);
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, user]);

  const persistItems = useCallback(
    async (nextItems: CartItem[]) => {
      setItems(nextItems);

      if (!user) {
        setLocalCart(nextItems);
        return;
      }

      await setDoc(
        doc(firestore, "users", user.uid, "private", "cart"),
        {
          items: nextItems,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user]
  );

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      const safeQuantity = Math.max(1, quantity);
      const currentItems = items.length > 0 ? items : getLocalCart();
      const existingItem = currentItems.find((item) => item.productId === product.id);
      const nextItems = existingItem
        ? currentItems.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + safeQuantity, 99) }
              : item
          )
        : [...currentItems, productToCartItem(product, safeQuantity)];

      await persistItems(nextItems);
    },
    [items, persistItems]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const safeQuantity = Math.max(0, Math.min(quantity, 99));
      const nextItems =
        safeQuantity === 0
          ? items.filter((item) => item.productId !== productId)
          : items.map((item) =>
              item.productId === productId ? { ...item, quantity: safeQuantity } : item
            );

      await persistItems(nextItems);
    },
    [items, persistItems]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await persistItems(items.filter((item) => item.productId !== productId));
    },
    [items, persistItems]
  );

  const clearCart = useCallback(async () => {
    setItems([]);

    if (!user) {
      setLocalCart([]);
      return;
    }

    await updateDoc(doc(firestore, "users", user.uid, "private", "cart"), {
      items: [],
      updatedAt: serverTimestamp(),
    }).catch(async () => {
      await deleteDoc(doc(firestore, "users", user.uid, "private", "cart")).catch(() => undefined);
    });
  }, [user]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      formattedSubtotal: formatCurrency(subtotal),
      loading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [addItem, clearCart, items, loading, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
