import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import logoImage from "@assets/logo01_1767784684828.png";
import JsBarcode from "jsbarcode";

interface PrintTicketProps {
  ticket: {
    ticketNumber: string;
    selectedNumbers: string | null;
    purchaseDate: string | Date;
    prizeAmount?: string | null;
    status: string;
    draw?: {
      name: string;
      drawDate?: string | Date;
      prizePool?: string | null;
    } | null;
    user?: {
      firstName?: string;
      lastName?: string;
    } | null;
  };
  buttonSize?: "default" | "sm" | "icon";
  buttonVariant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
}

export function PrintTicket({
  ticket,
  buttonSize = "icon",
  buttonVariant = "ghost",
  showLabel = false,
}: PrintTicketProps) {
  const generateBarcodeSvg = (text: string): string => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    try {
      JsBarcode(svg, text, {
        format: "CODE128",
        width: 1.5,
        height: 35,
        displayValue: false,
        margin: 0,
        background: "transparent",
        lineColor: "#1f4d3a",
      });
      return svg.outerHTML;
    } catch {
      return `<div style="font-family: monospace; font-size: 10px; color: #1f4d3a;">${text}</div>`;
    }
  };

  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        resolve("");
      };
      img.src = url;
    });
  };

  const handlePrint = async () => {
    const numbers = ticket.selectedNumbers
      ? ticket.selectedNumbers.split(",").map((n) => n.trim())
      : [];

    const barcodeSvg = generateBarcodeSvg(ticket.ticketNumber);

    const logoBase64 = await convertImageToBase64(logoImage);

    const purchaseDate = new Date(ticket.purchaseDate);
    const purchaseDateFormatted = `${purchaseDate.getDate()}/${purchaseDate.getMonth() + 1}/${purchaseDate.getFullYear()}`;

    const drawDate = ticket.draw?.drawDate
      ? new Date(ticket.draw.drawDate)
      : null;
    const drawDateFormatted = drawDate
      ? `${drawDate.getDate()}/${drawDate.getMonth() + 1}/${drawDate.getFullYear()}`
      : "";

    const year = new Date().getFullYear();

    const prizeAmount =
      ticket.draw?.prizePool || ticket.prizeAmount || "50,000";
    const prizeNumber = prizeAmount.replace(/[^\d]/g, "");
    const formattedPrize = parseInt(prizeNumber).toLocaleString("en-US");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى السماح بالنوافذ المنبثقة لطباعة التذكرة");
      return;
    }

    const logoSrc = logoBase64 || logoImage;
    const baseUrl = window.location.origin + (import.meta.env.BASE_URL || "/");

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <base href="${baseUrl}">
        <meta charset="UTF-8">
        <title>تذكرة #${ticket.ticketNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Cairo', sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          
          .ticket {
            width: 750px;
            height: 280px;
            background: linear-gradient(135deg, #fefef8 0%, #fffef5 50%, #fefef8 100%);
            border: 3px solid #1a5c3a;
            border-radius: 8px;
            display: flex;
            position: relative;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(26, 92, 58, 0.25);
          }
          
          .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 80%, rgba(200, 150, 180, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(150, 180, 150, 0.08) 0%, transparent 40%);
            pointer-events: none;
          }
          
          .stub-left {
            width: 90px;
            background: linear-gradient(180deg, #1a5c3a 0%, #0d3d26 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 12px 8px;
            position: relative;
            border-left: 2px dashed rgba(255,255,255,0.3);
          }
          
          .stub-left::after {
            content: '';
            position: absolute;
            left: -12px;
            top: 0;
            bottom: 0;
            width: 12px;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              #1a5c3a 8px,
              #1a5c3a 10px
            );
          }
          
          .stub-number {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            transform: rotate(180deg);
          }
          
          .stub-year {
            background: rgba(255,255,255,0.2);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: 800;
          }
          
          .stub-label {
            font-size: 9px;
            text-align: center;
            opacity: 0.9;
          }
          
          .main-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .header-band {
            background: linear-gradient(90deg, #1a5c3a 0%, #2d7a4e 50%, #1a5c3a 100%);
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
          }
          
          .header-emblem {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          
          .header-emblem img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .header-titles {
            text-align: center;
            flex: 1;
          }
          
          .title-ar {
            font-size: 22px;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            margin-bottom: 2px;
          }
          
          .title-en {
            font-size: 12px;
            font-weight: 600;
            opacity: 0.95;
            letter-spacing: 1px;
          }
          
          .content-area {
            flex: 1;
            display: flex;
            padding: 15px 20px;
            gap: 20px;
            position: relative;
          }
          
          .floral-bg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 150px;
            opacity: 0.12;
            background: radial-gradient(ellipse, #c87d9a 0%, transparent 70%);
            filter: blur(20px);
          }
          
          .info-left {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            z-index: 1;
          }
          
          .prize-display {
            text-align: center;
          }
          
          .prize-label {
            font-size: 11px;
            color: #1a5c3a;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .prize-amount {
            font-size: 42px;
            font-weight: 900;
            color: #1a5c3a;
            line-height: 1;
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 8px;
          }
          
          .prize-currency {
            font-size: 16px;
            font-weight: 700;
          }
          
          .prize-arabic {
            font-family: 'Amiri', serif;
            font-size: 28px;
            color: #8b4d6a;
            margin-top: 4px;
          }
          
          .center-decoration {
            width: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1;
          }
          
          .rose-container {
            width: 100px;
            height: 100px;
            position: relative;
          }
          
          .rose-svg {
            width: 100%;
            height: 100%;
          }
          
          .info-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
            z-index: 1;
          }
          
          .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
          }
          
          .info-label {
            color: #666;
            min-width: 80px;
          }
          
          .info-value {
            font-weight: 700;
            color: #1a5c3a;
          }
          
          .numbers-row {
            display: flex;
            gap: 6px;
            margin-top: 8px;
          }
          
          .number-ball {
            width: 28px;
            height: 28px;
            background: linear-gradient(145deg, #2d7a4e, #1a5c3a);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(26, 92, 58, 0.3);
          }
          
          .footer-band {
            background: #f8f5e8;
            border-top: 1px solid #ddd;
            padding: 8px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 9px;
            color: #666;
          }
          
          .barcode-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .barcode-container svg {
            height: 30px;
          }
          
          .footer-text {
            text-align: center;
            flex: 1;
          }
          
          .footer-warning {
            color: #c44;
            font-weight: 600;
          }
          
          .stub-right {
            width: 70px;
            background: linear-gradient(180deg, #1a5c3a 0%, #0d3d26 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px 8px;
            position: relative;
            border-right: 2px dashed rgba(255,255,255,0.3);
          }
          
          .stub-right::before {
            content: '';
            position: absolute;
            right: -12px;
            top: 0;
            bottom: 0;
            width: 12px;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              #1a5c3a 8px,
              #1a5c3a 10px
            );
          }
          
          .stub-right-number {
            writing-mode: vertical-lr;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 2px;
          }
          
          .stub-right-label {
            font-size: 9px;
            margin-top: 8px;
          }
          
          .winner-overlay {
            position: absolute;
            top: 10px;
            right: 100px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 4px 16px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 12px;
            transform: rotate(-5deg);
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
            z-index: 10;
          }
          
          @media print {
            body {
              background: white;
              padding: 10mm;
            }
            .ticket {
              box-shadow: none;
              border-width: 2px;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          ${ticket.status === "won" ? '<div class="winner-overlay">WINNER / فائز</div>' : ""}
          
          <div class="stub-left">
            <div class="stub-label">رقم التذكرة</div>
            <div class="stub-number">#${ticket.ticketNumber}</div>
            <div class="stub-year">${year}</div>
            <div class="stub-label">إصدار خاص<br/>Special Issue</div>
          </div>
          
          <div class="main-section">
            <div class="header-band">
              <div class="header-emblem">
                <img src="${logoSrc}" alt="Logo" />
              </div>
              <div class="header-titles">
                <div class="title-ar">اليانصيب الخيري الأردني</div>
                <div class="title-en">Jordanian Charity Lottery</div>
              </div>
              <div class="header-emblem">
                <img src="${logoSrc}" alt="Logo" />
              </div>
            </div>
            
            <div class="content-area">
              <div class="floral-bg"></div>
              
              <div class="info-left">
                <div class="prize-display">
                  <div class="prize-label">الجائزة الكبرى / Grand Prize</div>
                  <div class="prize-amount">
                    <span>${formattedPrize}</span>
                    <span class="prize-currency">J.D</span>
                  </div>
                  <div class="prize-arabic">دينار</div>
                </div>
              </div>
              
     
              <div class="info-right">
                <div class="info-row">
                  <span class="info-label">اسم السحب:</span>
                  <span class="info-value">${ticket.draw?.name || "سحب اليانصيب"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">تاريخ السحب:</span>
                  <span class="info-value">${drawDateFormatted || "قريباً"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">تاريخ الشراء:</span>
                  <span class="info-value">${purchaseDateFormatted}</span>
                </div>
                ${
                  numbers.length > 0
                    ? `
                  <div class="numbers-row">
                    ${numbers.map((n) => `<div class="number-ball">${n.toString().padStart(2, "0")}</div>`).join("")}
                  </div>
                `
                    : ""
                }
              </div>
            </div>
            
            <div class="footer-band">
              <div class="barcode-container">
                ${barcodeSvg}
                <span>#${ticket.ticketNumber}</span>
              </div>
              <div class="footer-text">
                <div class="footer-warning">يرجى الاحتفاظ بالتذكرة - Please keep your ticket</div>
                <div>من الأوراق النقدية للخطوة المقبلة</div>
              </div>
              <div style="font-size: 10px; color: #1a5c3a; font-weight: 600;">
                ${drawDateFormatted}
              </div>
            </div>
          </div>
          
          <div class="stub-right">
            <div class="stub-right-number">${year}</div>
            <div class="stub-right-label">سنة</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button
      size={buttonSize}
      variant={buttonVariant}
      onClick={handlePrint}
      data-testid="button-print-ticket"
    >
      <Printer className="h-4 w-4" />
      {showLabel && <span className="ms-2">طباعة</span>}
    </Button>
  );
}
