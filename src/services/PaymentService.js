import { notifications } from '@mantine/notifications';

const PaymentService = {
    // M-Pesa STK Push Mock
    triggerMpesaPush: async (amount, phoneNumber) => {
        notifications.show({
            title: 'M-Pesa STK Push Sent',
            message: `A payment request for KES ${amount * 130} has been sent to ${phoneNumber}. Please check your phone.`,
            color: 'green',
            loading: true,
            autoClose: false,
            id: 'mpesa-push'
        });

        // Mock processing delay
        return new Promise((resolve) => {
            setTimeout(() => {
                notifications.update({
                    id: 'mpesa-push',
                    title: 'Payment Confirmed',
                    message: 'Secure transaction completed successfully.',
                    color: 'green',
                    loading: false,
                    autoClose: 5000,
                });
                resolve({ success: true, transactionId: 'TXN_' + crypto.randomUUID() });
            }, 5000);
        });
    },

    // Visa/Card Payment Mock
    processCardPayment: async (cardDetails) => {
        // Premium simulation of encryption
        console.log('Encrypting sensitive data with TLS 1.3...');

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, transactionId: 'VISA_' + crypto.randomUUID() });
            }, 3000);
        });
    }
};

export default PaymentService;
