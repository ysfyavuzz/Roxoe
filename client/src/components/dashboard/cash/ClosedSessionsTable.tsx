import React, { useMemo } from "react";

import type { CashRegisterSession } from "../../../services/cashRegisterDB";
import { Table } from "../../ui/Table";

interface ClosedSessionsTableProps {
  displaySessions: CashRegisterSession[];
  allSessions: CashRegisterSession[];
  isLoading: boolean;
}

const ClosedSessionsTable: React.FC<ClosedSessionsTableProps> = ({ displaySessions, allSessions, isLoading }) => {
  const sessionColumns = [
    {
      key: "openingDate",
      title: "Tarih",
      render: (session: CashRegisterSession) => (
        <div className="text-sm text-gray-600">{new Date(session.openingDate).toLocaleDateString("tr-TR")}</div>
      ),
    },
    {
      key: "openingBalance",
      title: "Açılış Bakiye",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div className="text-sm font-medium text-blue-600">₺{session.openingBalance.toFixed(2)}</div>
      ),
    },
    {
      key: "cashSalesTotal",
      title: "Nakit Satış",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div className="text-sm text-gray-600">₺{session.cashSalesTotal?.toFixed(2) || "0.00"}</div>
      ),
    },
    {
      key: "cardSalesTotal",
      title: "Kart Satış",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div className="text-sm text-gray-600">₺{session.cardSalesTotal?.toFixed(2) || "0.00"}</div>
      ),
    },
    {
      key: "cashDepositTotal",
      title: "Nakit Giriş",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div className="text-sm text-green-600">+₺{session.cashDepositTotal?.toFixed(2) || "0.00"}</div>
      ),
    },
    {
      key: "cashWithdrawalTotal",
      title: "Nakit Çıkış",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div className="text-sm text-red-500">-₺{session.cashWithdrawalTotal?.toFixed(2) || "0.00"}</div>
      ),
    },
    {
      key: "countingDifference",
      title: "Fark",
      className: "text-right",
      render: (session: CashRegisterSession) => (
        <div>
{(session.countingDifference !== null && session.countingDifference !== undefined) ? (
            <span
              className={
                session.countingDifference < 0
                  ? "text-sm text-red-600"
                  : session.countingDifference > 0
                  ? "text-sm text-green-600"
                  : "text-sm text-gray-600"
              }
            >
              {session.countingDifference > 0 && "+"}₺
              {session.countingDifference.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </div>
      ),
    },
  ];

  const totalColumns: Partial<Record<keyof CashRegisterSession, "sum" | "count">> = useMemo(() => ({
    openingBalance: "sum",
    cashSalesTotal: "sum",
    cardSalesTotal: "sum",
    cashDepositTotal: "sum",
    cashWithdrawalTotal: "sum",
    countingDifference: "sum",
  }), []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Son Kasa Oturumları</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800">Tümünü Gör</button>
      </div>
      <div className="overflow-hidden">
        <Table
          data={displaySessions}
          columns={sessionColumns}
          enableSorting={true}
          defaultSortKey="openingDate"
          defaultSortDirection="desc"
          loading={isLoading}
          emptyMessage="Kasa oturum verisi bulunmuyor."
          showTotals={true}
          totalColumns={totalColumns}
          totalData={allSessions}
          className="border-none rounded-none"
        />
      </div>
    </div>
  );
};

export default ClosedSessionsTable;

