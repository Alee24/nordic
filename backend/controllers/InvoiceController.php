<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

/**
 * Lightweight PDF generator (FPDF-compatible subset)
 * No external dependencies required
 */
class SimplePDF {
    private $content = '';
    private $y = 10;
    
    public function __construct() {
        $this->content = "%PDF-1.4\n";
    }
    
    public function AddPage() {
        // Simplified - real implementation would track pages
    }
    
    public function SetFont($family, $style, $size) {
        // Font handling
    }
    
    public function Cell($w, $h, $txt, $border = 0, $ln = 0) {
        $this->y += $h;
    }
    
    public function Output($name = '', $dest = 'I') {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $name . '"');
        echo $this->generateSimplePDF();
    }
    
    private function generateSimplePDF() {
        // This is a placeholder - we'll use HTML to PDF conversion instead
        return "";
    }
}

class InvoiceController {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Generate and download PDF invoice for a booking
     */
    public function generateInvoice($bookingId) {
        try {
            // Fetch booking details with all related info
           $query = "
                SELECT 
                    b.*,
                    r.name as room_name,
                    r.base_price,
                    r.room_type,
                    p.name as property_name,
                    p.address,
                    p.city
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                LEFT JOIN properties p ON b.property_id = p.id
                WHERE b.id = :booking_id
            ";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);
            $stmt->execute();
            
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$booking) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Booking not found']);
                return;
            }
            
            // Generate HTML invoice
            $html = $this->generateHTMLInvoice($booking);
            
            // Convert HTML to PDF using wkhtmltopdf or similar
            // For now, we'll return HTML with print styling
            header('Content-Type: text/html; charset=UTF-8');
            echo $html;
            echo '<script>window.print();</script>';
            
        } catch (Exception $e) {
            error_log("Generate Invoice Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    private function generateHTMLInvoice($booking) {
        $checkIn = date('M d, Y', strtotime($booking['check_in']));
        $checkOut = date('M d, Y', strtotime($booking['check_out']));
        $nights = (strtotime($booking['check_out']) - strtotime($booking['check_in'])) / 86400;
        $totalPrice = number_format($booking['total_amount'], 2);
        $invoiceDate = date('F d, Y');
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - {$booking['booking_reference']}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #1e40af;
margin: 0;
            font-size: 32px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .detail-box {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .detail-box h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
            font-size: 14px;
            text-transform: uppercase;
        }
        .detail-box p {
            margin: 5px 0;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #1e40af;
            color: white;
            font-weight: 600;
        }
        .total-row {
            background: #f1f5f9;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-paid {
            background: #dcfce7;
            color: #166534;
        }
        .status-unpaid {
            background: #fee2e2;
            color: #991b1b;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 NORDEN SUITES</h1>
        <p>Coastal Luxury Apartments</p>
        <p>Nyali, Mombasa, Kenya | +254 724 454 757</p>
    </div>

    <div style="text-align: right; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1e40af;">INVOICE</h2>
        <p style="margin: 5px 0;">#{$booking['booking_reference']}</p>
        <p style="margin: 5px 0; color: #666;">Date: {$invoiceDate}</p>
    </div>

    <div class="invoice-details">
        <div class="detail-box">
            <h3>Guest Information</h3>
            <p><strong>{$booking['guest_name']}</strong></p>
            <p>{$booking['guest_email']}</p>
            <p>{$booking['guest_phone']}</p>
        </div>
        <div class="detail-box">
            <h3>Reservation Details</h3>
            <p><strong>Property:</strong> {$booking['property_name']}</p>
            <p><strong>Room:</strong> {$booking['room_name']}</p>
            <p><strong>Status:</strong> <span class="status-badge status-{$booking['payment_status']}">{$booking['payment_status']}</span></p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Nights</th>
                <th>Amount (KES)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{$booking['room_name']}</td>
                <td>{$checkIn}</td>
                <td>{$checkOut}</td>
                <td>{$nights}</td>
                <td>KES {$totalPrice}</td>
            </tr>
            <tr class="total-row">
                <td colspan="4" style="text-align: right;">Total Amount:</td>
                <td>KES {$totalPrice}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Thank you for choosing Norden Suites!</p>
        <p>For inquiries, contact us at info@nordensuits.com</p>
        <p style="margin-top: 10px; font-size: 10px;">This is a computer-generated invoice and does not require a signature.</p>
    </div>

    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #1e40af; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            Print Invoice
        </button>
        <button onclick="window.close()" style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
            Close
        </button>
    </div>
</body>
</html>
HTML;
    }
}

