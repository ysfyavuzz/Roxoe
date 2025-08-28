import React from "react";
import Card from "../../ui/Card";
import type { ProductStats } from "../../../types/product";

interface ProductSummaryCardsProps {
  products: ProductStats[];
}

const ProductSummaryCards: React.FC<ProductSummaryCardsProps> = ({ products }) => {
  const sortedByQuantity = [...products].sort((a, b) => b.quantity - a.quantity);
  const sortedByProfit = [...products].sort((a, b) => b.profit - a.profit);

  const totalProducts = products.length;
  const topSelling = sortedByQuantity[0];
  const mostProfitable = sortedByProfit[0];

  const avgPrice = products.length > 0
    ? (products.reduce((sum, item) => sum + item.revenue, 0) /
       products.reduce((sum, item) => sum + item.quantity, 0))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Card
        variant="summary"
        title="Toplam Ürün"
        value={totalProducts}
        description="Satılan farklı ürün"
        color="indigo"
      />

      <Card
        variant="summary"
        title="En Çok Satan"
        value={topSelling ? topSelling.name : "-"}
        description={topSelling ? `${topSelling.quantity} adet` : "Veri yok"}
        color="blue"
      />

      <Card
        variant="summary"
        title="En Kârlı Ürün"
        value={mostProfitable ? mostProfitable.name : "-"}
        description={mostProfitable ? `₺${mostProfitable.profit.toFixed(2)}` : "Veri yok"}
        color="green"
      />

      <Card
        variant="summary"
        title="Ortalama Fiyat"
        value={`₺${avgPrice.toFixed(2)}`}
        description="Ortalama birim fiyat"
        color="purple"
      />
    </div>
  );
};

export default ProductSummaryCards;

