const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const paymentLabel = { cod: 'Thanh toán khi nhận hàng (COD)', bank: 'Chuyển khoản ngân hàng', momo: 'Ví MoMo' };

const sendOrderNotification = async (order) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP chưa cấu hình, bỏ qua gửi email.');
    return;
  }

  const subject = `🛒 Đơn hàng mới #${order.id} – ${order.customer_name}`;

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#16a34a;padding:24px 32px">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold">🌿 Cashew Essence</p>
          <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px">Thông báo đơn hàng mới</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 20px;font-size:16px;color:#111827">
            Có đơn hàng mới <strong>#${order.id}</strong> vừa được đặt:
          </p>

          <!-- Order info table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px">
            <tr style="background:#f9fafb">
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%">Mã đơn hàng</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600">#${order.id}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Sản phẩm</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">Pate Hạt Điều Chay ${order.size} × ${order.quantity || 1}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Tổng tiền</td>
              <td style="padding:10px 16px;font-size:14px;color:#16a34a;font-weight:700;border-top:1px solid #e5e7eb">${(Number(order.price) * (order.quantity || 1)).toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Thanh toán</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">${paymentLabel[order.payment] || order.payment}</td>
            </tr>
          </table>

          <!-- Customer info -->
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827">Thông tin khách hàng:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <tr style="background:#f9fafb">
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%">Họ tên</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Số điện thoại</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">${order.phone}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Địa chỉ</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">${order.address}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Thời gian</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">${new Date(order.created_at).toLocaleString('vi-VN')}</td>
            </tr>
          </table>

          <p style="margin:0;font-size:13px;color:#6b7280">
            Vui lòng liên hệ khách hàng sớm để xác nhận đơn hàng.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
            © 2026 Cashew Essence · Email tự động, vui lòng không trả lời
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Cashew Essence" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  });

  console.log(`📧 Email thông báo đơn #${order.id} đã gửi tới ${process.env.ADMIN_EMAIL}`);
};

module.exports = { sendOrderNotification };
