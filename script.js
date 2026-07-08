document.addEventListener("DOMContentLoaded", function () {

  const TELEGRAM_BOT_TOKEN = "8705091187:AAFVyLB7g2Y6wMqYB_y8Uaj1bOmyelIwURg";
  const TELEGRAM_CHAT_ID = "7576852062";
  const LINE_URL = "https://line.me/ti/p/jyGaF9NYQ2";

  let isSubmitting = false;

  // =========================
  // Event ID
  // =========================
  function getEventId() {
    return crypto.randomUUID();
  }

  // =========================
  // GA
  // =========================
  function trackGA(name, params = {}) {
    if (typeof gtag === "function") {
      gtag("event", name, params);
      console.log("GA:", name, params);
    }
  }

  // =========================
  // META PRO
  // =========================
   function trackMeta(eventName, params = {}) {
   const eventId = getEventId();

   if (typeof fbq === "function") {
     fbq("track", eventName, params, {
       eventID: eventId
     });

     console.log("Meta:", eventName, params, eventId);
   }

   return eventId;
}

  // Page View Content
  trackMeta("ViewContent", {
    content_name: "iphone_cash_page"
  });

  // =========================
  // =========================
  // LINE CLICK (PRO)
  // =========================
  const lineButtons = document.querySelectorAll(
    ".line-btn, .cta-btn, .floating-line"
  );

  lineButtons.forEach(btn => {

    btn.addEventListener("click", function (e) {

      e.preventDefault();

      const url = btn.href;

      trackGA("line_click", {
        source: btn.className
      });

      trackMeta("Lead", {
        content_name: "line_click",
        button_type: btn.className
      });

      const ua = navigator.userAgent.toLowerCase();

      setTimeout(() => {

        // ===== WeChat =====
        if (ua.includes("micromessenger")) {

          const openBrowser = confirm(
  `微信內建瀏覽器無法直接開啟 LINE。

  請點右上角 ⋯

  選擇：

  「在 Safari 開啟」
  或
  「在 Chrome 開啟」

  之後再加入 LINE。`
          );

          return;
        }

        // ===== LINE APP =====
        if (ua.includes("line")) {
          window.location.href = url;
          return;
        }

        // ===== Facebook =====
        if (ua.includes("fbav")) {
          window.location.href = url;
          return;
        }

        // ===== Instagram =====
        if (ua.includes("instagram")) {
          window.location.href = url;
          return;
        }

        // ===== Safari =====
        if (
          ua.includes("safari") &&
          !ua.includes("chrome")
        ) {

          window.location.href = url;

          return;
        }

       // ===== Android Chrome =====
        if (ua.includes("android")) {
          window.location.href = url;
          return;
        }

        // ===== Desktop =====
        window.open(url, "_blank");

      }, 150);

    });

  });

  // =========================
  // Form
  // =========================
  const form = document.getElementById("consult-form");

  if (form) {

    let formStarted = false;

     form.addEventListener("input", function () {
       if (!formStarted) {
         formStarted = true;

         trackGA("begin_form");

         trackMeta("InitiateCheckout", {
           content_name: "consult_form"
          });
         }
        });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (isSubmitting) return;
      isSubmitting = true;

      const submitBtn = document.getElementById("submit-btn");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const lineid = document.getElementById("lineid").value;
        const iphone = document.getElementById("iphone").value;
        const amount = document.getElementById("amount").value;

        const message =
`🔔 新客戶諮詢

姓名：${name}
電話：${phone}
LINE ID：${lineid}
手機型號：${iphone}
資金需求：${amount}`;

        const res = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message
            })
          }
        );

        const result = await res.json();
        console.log("Telegram:", result);

        if (!result.ok) {
          throw new Error(result.description);
        }

        trackGA("generate_lead", {
          form_name: "consult_form",
          iphone_model: iphone || "unknown"
        }); 

        trackMeta("Lead", {
          content_name: "form_submit"
        });

        trackMeta("CompleteRegistration", {
          status: "completed",
          value: Number(amount) || 0,
          currency: "TWD"
        });

        alert("送出成功！即將跳轉 LINE");

        form.reset();
        window.open(LINE_URL, "_blank");

      } catch (err) {
        console.error(err);
        alert("送出失敗：" + err.message);
      }

      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    });
  }

  // =========================
  // FAQ
  // =========================
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    item.addEventListener("click", function () {
      const p = this.querySelector("p");

      p.style.display =
        (p.style.display === "none" || p.style.display === "")
          ? "block"
          : "none";
    });
  });

});