import { create } from 'zustand';
import cartApi from '../api/cartApi';
import useAuthStore from './authStore';

const GUEST_CART_KEY = 'guestCart';

const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  cartCount: 0,
  loading: false,
  selectedItems: [],

  initCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      await get().fetchCart();
    } else {
      const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      set({
        items: guestCart,
        cartCount: guestCart.reduce((acc, item) => acc + item.quantity, 0),
        cart: { items: guestCart, totalPrice: guestCart.reduce((acc, item) => acc + (item.price * item.quantity), 0) }
      });
    }
  },

  fetchCart: async () => {
    const { isAuthenticated, permissions } = useAuthStore.getState();
    // Chỉ fetch giỏ hàng nếu đã đăng nhập VÀ là CUSTOMER
    if (!isAuthenticated || !permissions.includes('ROLE_CUSTOMER')) return;

    set({ loading: true });
    try {
      const response = await cartApi.getCart();
      const cartData = response.data || response;
      set({
        cart: cartData,
        items: cartData.items || [],
        cartCount: cartData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productVariantId, quantity, productInfo = null) => {
    const { isAuthenticated, permissions } = useAuthStore.getState();

    if (isAuthenticated) {
      if (!permissions.includes('ROLE_CUSTOMER')) {
        const error = new Error('Tài khoản quản trị không được phép mua hàng!');
        error.response = { data: { message: error.message } };
        throw error;
      }
      try {
        const response = await cartApi.addToCart({ productVariantId, quantity });
        const cartData = response.data || response;
        set({
          cart: cartData,
          items: cartData.items || [],
          cartCount: cartData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
        });
        return true;
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    } else {
      // Guest logic
      const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const existingItemIndex = guestCart.findIndex(item => item.productVariantId === productVariantId);

      if (existingItemIndex > -1) {
        guestCart[existingItemIndex].quantity += quantity;
      } else {
        guestCart.push({
          id: `guest_${productVariantId}`, // temporary ID
          productVariantId,
          quantity,
          productName: productInfo?.productName || 'Sản phẩm',
          variantAttributes: productInfo?.variantAttributes || '',
          price: productInfo?.price || 0,
          imageUrl: productInfo?.imageUrl || null
        });
      }

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
      set({
        items: guestCart,
        cartCount: guestCart.reduce((acc, item) => acc + item.quantity, 0),
        cart: { items: guestCart, totalPrice: guestCart.reduce((acc, item) => acc + (item.price * item.quantity), 0) }
      });
      return true;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      try {
        const response = await cartApi.updateQuantity(itemId, quantity);
        const cartData = response.data || response;
        set({
          cart: cartData,
          items: cartData.items || [],
          cartCount: cartData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
        });
      } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
      }
    } else {
      // Guest logic
      const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const itemIndex = guestCart.findIndex(item => item.id === itemId);
      if (itemIndex > -1) {
        if (quantity <= 0) {
          guestCart.splice(itemIndex, 1);
        } else {
          guestCart[itemIndex].quantity = quantity;
        }
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        set({
          items: guestCart,
          cartCount: guestCart.reduce((acc, item) => acc + item.quantity, 0),
          cart: { items: guestCart, totalPrice: guestCart.reduce((acc, item) => acc + (item.price * item.quantity), 0) }
        });
      }
    }
  },

  removeItem: async (itemId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      try {
        const response = await cartApi.removeItem(itemId);
        const cartData = response.data || response;
        set({
          cart: cartData,
          items: cartData.items || [],
          cartCount: cartData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
        });
      } catch (error) {
        console.error('Error removing item:', error);
        throw error;
      }
    } else {
      // Guest logic
      let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      guestCart = guestCart.filter(item => item.id !== itemId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
      set({
        items: guestCart,
        cartCount: guestCart.reduce((acc, item) => acc + item.quantity, 0),
        cart: { items: guestCart, totalPrice: guestCart.reduce((acc, item) => acc + (item.price * item.quantity), 0) }
      });
    }
  },

  mergeGuestCart: async (combine = true) => {
    const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    if (guestCart.length === 0) return;

    try {
      const itemsToMerge = guestCart.map(item => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      }));

      const response = await cartApi.mergeCart({ items: itemsToMerge, combine });
      const cartData = response.data || response;

      set({
        cart: cartData,
        items: cartData.items || [],
        cartCount: cartData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
      });

      localStorage.removeItem(GUEST_CART_KEY);
      return true;
    } catch (error) {
      console.error('Error merging cart:', error);
      throw error;
    }
  },

  setSelectedItems: (keys) => {
    set({ selectedItems: keys });
  },

  toggleSelectItem: (itemId) => {
    set(state => {
      const isSelected = state.selectedItems.includes(itemId);
      if (isSelected) {
        return { selectedItems: state.selectedItems.filter(id => id !== itemId) };
      } else {
        return { selectedItems: [...state.selectedItems, itemId] };
      }
    });
  },

  clearCartLocal: () => {
    set({ cart: null, items: [], cartCount: 0, selectedItems: [] });
  }
}));

export default useCartStore;
