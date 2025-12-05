import { createContext, useContext, useState } from 'react';
import CustomAlert from '../components/ui/CustomAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success', // success, error, confirm
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'OK',
    cancelText: 'Batal'
  });

  const showAlert = (title, message, type = 'success', onConfirm = null) => {
    // Jika onConfirm tidak diisi, defaultnya cuma tutup alert
    const handleConfirm = () => {
      setAlertConfig((prev) => ({ ...prev, visible: false }));
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      setAlertConfig((prev) => ({ ...prev, visible: false }));
    };

    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      confirmText: type === 'confirm' ? 'Ya' : 'OK',
      cancelText: 'Batal'
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert {...alertConfig} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);