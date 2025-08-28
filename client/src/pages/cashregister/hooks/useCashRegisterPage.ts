import { useState, useEffect, useMemo, useCallback } from "react";
import { useAlert } from "../../../components/AlertProvider";
import { formatCurrency } from "../../../utils/vatUtils";
import { CashRegisterStatus, CashTransactionType } from "../../../types/cashRegister";
import { cashRegisterService } from "../../../services/cashRegisterDB";
import { creditService } from "../../../services/creditServices";
import eventBus from "../../../utils/eventBus";

export function useCashRegisterPage() {
  const { showSuccess, showError, confirm } = useAlert();

  // Kasa durumları ve oturum bilgileri
  const [registerStatus, setRegisterStatus] = useState<CashRegisterStatus>(CashRegisterStatus.CLOSED);
  const [sessionId, setSessionId] = useState<string>("");
  const [openingDate, setOpeningDate] = useState<Date | null>(null);
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  // Günlük veriler
  const [dailyCashSales, setDailyCashSales] = useState<number>(0);
  const [dailyCardSales, setDailyCardSales] = useState<number>(0);
  const [cashWithdrawals, setCashWithdrawals] = useState<number>(0);
  const [cashDeposits, setCashDeposits] = useState<number>(0);

  // Sayım
  const [countingAmount, setCountingAmount] = useState<number>(0);
  const [countingDifference, setCountingDifference] = useState<number>(0);

  // Açılış bakiyesi girişi
  const [newOpeningBalance, setNewOpeningBalance] = useState<string>("");

  // İşlem modalları ve alanları
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [transactionDescription, setTransactionDescription] = useState<string>("");

  // Sayım modalı
  const [showCountingModal, setShowCountingModal] = useState<boolean>(false);
  const [countingInputAmount, setCountingInputAmount] = useState<string>("");

  // İşlem geçmişi ve yükleme
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Veresiye tahsilatı
  const [showCreditCollectionModal, setShowCreditCollectionModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  // Türev değerler
  const theoreticalBalance = useMemo(() => {
    return openingBalance + dailyCashSales + cashDeposits - cashWithdrawals;
  }, [openingBalance, dailyCashSales, cashDeposits, cashWithdrawals]);

  const dailyTotalSales = useMemo(() => {
    return dailyCashSales + dailyCardSales - cashWithdrawals + cashDeposits;
  }, [dailyCashSales, dailyCardSales, cashWithdrawals, cashDeposits]);

  // Aktif kasa oturumunu yükle
  const loadCashRegister = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeSession = await cashRegisterService.getActiveSession();
      if (activeSession) {
        setRegisterStatus(CashRegisterStatus.OPEN);
        setSessionId(activeSession.id);
        setOpeningDate(new Date(activeSession.openingDate));
        setOpeningBalance(activeSession.openingBalance);
        setDailyCashSales(activeSession.cashSalesTotal);
        setDailyCardSales(activeSession.cardSalesTotal);
        setCashDeposits(activeSession.cashDepositTotal);
        setCashWithdrawals(activeSession.cashWithdrawalTotal);

        if (activeSession.countingAmount !== undefined) {
          setCountingAmount(activeSession.countingAmount);
          setCountingDifference(activeSession.countingDifference ?? 0);
        }

        const sessionDetails = await cashRegisterService.getSessionDetails(activeSession.id);
        setTransactions(sessionDetails.transactions);
      } else {
        setRegisterStatus(CashRegisterStatus.CLOSED);
      }
    } catch (error) {
      console.error("Kasa bilgileri yüklenirken hata:", error);
      showError("Kasa bilgileri yüklenirken bir hata oluştu!");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCashRegister();
  }, [loadCashRegister]);

  // Müşteri listesini yükle
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersList = await creditService.getAllCustomers();
        setCustomers(customersList);
      } catch (error) {
        console.error("Müşteriler yüklenirken hata:", error);
        showError("Müşteri listesi yüklenirken bir hata oluştu!");
      }
    };

    loadCustomers();
  }, [showError]);

  // Aksiyonlar
  const handleOpenRegister = useCallback(async () => {
    if (!newOpeningBalance || isNaN(parseFloat(newOpeningBalance)) || parseFloat(newOpeningBalance) < 0) {
      showError("Lütfen geçerli bir açılış bakiyesi girin");
      return;
    }

    try {
      const session = await cashRegisterService.openRegister(parseFloat(newOpeningBalance));
      eventBus.emit("cashRegisterOpened", {
        openingBalance: session.openingBalance,
        sessionId: session.id,
      });

      setRegisterStatus(CashRegisterStatus.OPEN);
      setSessionId(session.id);
      setOpeningDate(new Date(session.openingDate));
      setOpeningBalance(session.openingBalance);
      setDailyCashSales(0);
      setDailyCardSales(0);
      setCashWithdrawals(0);
      setCashDeposits(0);
      setNewOpeningBalance("");
      setTransactions([]);

      showSuccess("Kasa başarıyla açıldı");
      await loadCashRegister();
    } catch (error) {
      console.error("Kasa açılırken hata:", error);
      showError("Kasa açılırken bir hata oluştu!");
    }
  }, [newOpeningBalance, showError, showSuccess, loadCashRegister]);

  const handleCashDeposit = useCallback(async () => {
    if (!transactionAmount || isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      showError("Lütfen geçerli bir tutar girin");
      return;
    }

    try {
      await cashRegisterService.addCashTransaction(
        sessionId,
        CashTransactionType.DEPOSIT,
        parseFloat(transactionAmount),
        transactionDescription || "Nakit Giriş"
      );

      setCashDeposits((prev) => prev + parseFloat(transactionAmount));

      const sessionDetails = await cashRegisterService.getSessionDetails(sessionId);
      setTransactions(sessionDetails.transactions);

      showSuccess(`${formatCurrency(parseFloat(transactionAmount))} nakit giriş kaydedildi`);

      setShowDepositModal(false);
      setTransactionAmount("");
      setTransactionDescription("");
    } catch (error) {
      console.error("Nakit giriş eklenirken hata:", error);
      showError("Nakit giriş eklenirken bir hata oluştu!");
    }
  }, [sessionId, transactionAmount, transactionDescription, showError, showSuccess]);

  const handleCashWithdrawal = useCallback(async () => {
    if (!transactionAmount || isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      showError("Lütfen geçerli bir tutar girin");
      return;
    }

    if (parseFloat(transactionAmount) > theoreticalBalance) {
      showError("Kasada yeterli nakit yok");
      return;
    }

    try {
      await cashRegisterService.addCashTransaction(
        sessionId,
        CashTransactionType.WITHDRAWAL,
        parseFloat(transactionAmount),
        transactionDescription || "Nakit Çıkış"
      );

      setCashWithdrawals((prev) => prev + parseFloat(transactionAmount));

      const sessionDetails = await cashRegisterService.getSessionDetails(sessionId);
      setTransactions(sessionDetails.transactions);

      showSuccess(`${formatCurrency(parseFloat(transactionAmount))} nakit çıkış kaydedildi`);

      setShowWithdrawalModal(false);
      setTransactionAmount("");
      setTransactionDescription("");
    } catch (error) {
      console.error("Nakit çıkış eklenirken hata:", error);
      showError("Nakit çıkış eklenirken bir hata oluştu!");
    }
  }, [sessionId, transactionAmount, transactionDescription, theoreticalBalance, showError, showSuccess]);

  const handleCreditCollection = useCallback(async () => {
    if (!selectedCustomer) {
      showError("Lütfen bir müşteri seçin");
      return;
    }
    if (!transactionAmount || isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      showError("Lütfen geçerli bir tutar girin");
      return;
    }

    try {
      const amount = parseFloat(transactionAmount);

      await cashRegisterService.addCashTransaction(
        sessionId,
        CashTransactionType.DEPOSIT,
        amount,
        `Veresiye Tahsilatı - ${selectedCustomer.name}`
      );

      await creditService.addTransaction({
        customerId: selectedCustomer.id,
        type: "payment",
        amount: amount,
        date: new Date(),
        description: `Kasa Tahsilatı - ${new Date().toLocaleString("tr-TR")}`,
      });

      setCashDeposits((prev) => prev + amount);

      const sessionDetails = await cashRegisterService.getSessionDetails(sessionId);
      setTransactions(sessionDetails.transactions);

      showSuccess(`${formatCurrency(amount)} veresiye tahsilatı kaydedildi`);

      setShowCreditCollectionModal(false);
      setTransactionAmount("");
      setTransactionDescription("");
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Veresiye tahsilatı sırasında hata:", error);
      showError("Veresiye tahsilatı sırasında bir hata oluştu!");
    }
  }, [selectedCustomer, sessionId, transactionAmount, showError, showSuccess]);

  const handleCounting = useCallback(async () => {
    if (!countingInputAmount || isNaN(parseFloat(countingInputAmount))) {
      showError("Lütfen geçerli bir tutar girin");
      return;
    }

    try {
      const updatedSession = await cashRegisterService.saveCounting(
        sessionId,
        parseFloat(countingInputAmount)
      );

      setCountingAmount(updatedSession.countingAmount ?? 0);
      setCountingDifference(updatedSession.countingDifference ?? 0);

      setShowCountingModal(false);
      showSuccess("Kasa sayımı kaydedildi");
    } catch (error) {
      console.error("Kasa sayımı kaydedilirken hata:", error);
      showError("Kasa sayımı kaydedilirken bir hata oluştu!");
    }
  }, [sessionId, countingInputAmount, showError, showSuccess]);

  const handleCloseDay = useCallback(async () => {
    const confirmed = await confirm("Günü kapatmak istediğinize emin misiniz? Bu işlem geri alınamaz.");
    if (!confirmed) return;

    if (countingAmount === 0) {
      const proceedWithoutCounting = await confirm("Kasa sayımı yapılmamış. Sayım yapmadan devam etmek istiyor musunuz?");
      if (!proceedWithoutCounting) {
        setShowCountingModal(true);
        return;
      }
    }

    try {
      await cashRegisterService.closeRegister(sessionId);

      const highSalesThreshold = 1000;
      const isHighSales = dailyTotalSales > highSalesThreshold;

      const hasSignificantNegativeDifference = countingDifference < -50;
      const lowSalesThreshold = 100;
      const hasNoOrLowSales = dailyTotalSales < lowSalesThreshold;
      const netCashFlow = dailyCashSales + cashDeposits - cashWithdrawals;
      const hasNegativeCashFlow = netCashFlow < 0;
      const isLossMaking = hasSignificantNegativeDifference || (hasNoOrLowSales && hasNegativeCashFlow);

      eventBus.emit("cashRegisterClosed", {
        totalSales: dailyTotalSales,
        cashSales: dailyCashSales,
        cardSales: dailyCardSales,
        countingDifference: countingDifference,
        theoreticalBalance: theoreticalBalance,
        isHighSales: isHighSales,
        isLossMaking: isLossMaking,
      });

      showSuccess("Gün başarıyla kapatıldı. Kasa raporu oluşturuldu.");
      setRegisterStatus(CashRegisterStatus.CLOSED);

      // Sıfırla
      setSessionId("");
      setOpeningDate(null);
      setOpeningBalance(0);
      setDailyCashSales(0);
      setDailyCardSales(0);
      setCashWithdrawals(0);
      setCashDeposits(0);
      setCountingAmount(0);
      setCountingDifference(0);
      setTransactions([]);

      // Yenile
      await loadCashRegister();
    } catch (error) {
      console.error("Gün kapatılırken hata:", error);
      showError("Gün kapatılırken bir hata oluştu!");
    }
  }, [confirm, countingAmount, sessionId, dailyTotalSales, countingDifference, dailyCashSales, cashDeposits, cashWithdrawals, dailyCardSales, theoreticalBalance, showSuccess, showError, loadCashRegister]);

  return {
    // durumlar
    registerStatus,
    sessionId,
    openingDate,
    openingBalance,
    dailyCashSales,
    dailyCardSales,
    cashWithdrawals,
    cashDeposits,
    countingAmount,
    countingDifference,
    newOpeningBalance,
    showDepositModal,
    showWithdrawalModal,
    transactionAmount,
    transactionDescription,
    showCountingModal,
    countingInputAmount,
    transactions,
    isLoading,
    showCreditCollectionModal,
    selectedCustomer,
    customers,

    // türev
    theoreticalBalance,
    dailyTotalSales,

    // setter/aksiyonlar
    setNewOpeningBalance,
    setShowDepositModal,
    setShowWithdrawalModal,
    setTransactionAmount,
    setTransactionDescription,
    setShowCountingModal,
    setCountingInputAmount,
    setShowCreditCollectionModal,
    setSelectedCustomer,

    // işlemler
    loadCashRegister,
    handleOpenRegister,
    handleCashDeposit,
    handleCashWithdrawal,
    handleCreditCollection,
    handleCounting,
    handleCloseDay,
  };
}

