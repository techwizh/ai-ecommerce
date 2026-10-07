export const formatPrice = (amount: number) =>
  `KSh ${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;