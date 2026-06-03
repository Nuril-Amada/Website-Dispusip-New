document.addEventListener("DOMContentLoaded", () => {

  /* ================= HERO SLIDER ================= */
  const slider = document.getElementById("slider");

  if (slider) {
    const slides = slider.children;
    let index = 0;

    setInterval(() => {
      index = (index + 1) % slides.length;
      slider.style.transform = `translateX(-${index * 100}vw)`;
    }, 4000);
  }

  /* ================= POPUP SCROLL ================= */
  const popupElements = document.querySelectorAll(
    ".popup, .stat-card, .kepuasan-left, .kepuasan-right"
  );

  const popupObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else {
          entry.target.classList.remove("show");
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -120px 0px"
    }
  );

  popupElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.15}s`;
    popupObserver.observe(el);
  });

  /* ================= AUTO SLIDE ================= */

  function startAutoSlide(trackSelector) {
    const track = document.querySelector(trackSelector);

    if (!track) return;

    const cards = track.children;
    const gap = 28;
    const visible = 2;

    let index = 0;

    function slide() {
      const cardWidth = cards[0].offsetWidth + gap;

      index++;

      if (index > cards.length - visible) {
        index = 0;
      }

      track.style.transform =
        `translateX(-${index * cardWidth}px)`;
    }

    setInterval(slide, 3000);
  }

  startAutoSlide(".artikel-track");
  startAutoSlide(".berita-track");

  /* ================= NAVBAR MOBILE ================= */

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const dropdownMenus = document.querySelectorAll(".has-dropdown");

  hamburger.addEventListener("click", function (e) {
    e.stopPropagation();

    navMenu.classList.toggle("active");

    if (!navMenu.classList.contains("active")) {
      dropdownMenus.forEach(menu => {
        menu.classList.remove("active");
      });
    }
  });

  dropdownMenus.forEach(menu => {
    menu.addEventListener("click", function (e) {

      if (window.innerWidth <= 768) {

        e.stopPropagation();

        dropdownMenus.forEach(otherMenu => {
          if (otherMenu !== menu) {
            otherMenu.classList.remove("active");
          }
        });

        menu.classList.toggle("active");
      }

    });
  });

  document.addEventListener("click", function (e) {

    if (
      window.innerWidth <= 768 &&
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {

      navMenu.classList.remove("active");

      dropdownMenus.forEach(menu => {
        menu.classList.remove("active");
      });

    }

  });

  /* ================= FETCH JSON ================= */

fetch('dashboard_final.json')
  .then(response => response.json())
  .then(data => {

    console.log("JSON berhasil dibaca:", data);

    // Data aktual (IKM tidak null)
    const validData = data.filter(
      item => item["IKM Konversi"] !== null
    );

    // Data forecasting (IKM null)
    const forecastData = data.filter(
      item => item["IKM Konversi"] === null
    );

    const latest = validData[validData.length - 1];

    const avgIKM =
      validData.reduce((sum, item) =>
        sum + item["IKM Konversi"], 0
      ) / validData.length;

    const lastPrediksi =
      forecastData.length > 0
        ? forecastData[forecastData.length - 1]["Prediksi"]
        : latest["Prediksi"];

    const totalData = data.length;

    const persentase =
      latest["IKM Konversi"];

    const tanggal =
      new Date(latest["Tanggal"]).toLocaleDateString(
        "id-ID",
        {
          month: "long",
          year: "numeric"
        }
      );

    // ================= KPI =================

    document.getElementById("avgIKM").innerText =
      avgIKM.toFixed(2) + "%";

    document.getElementById("lastPrediksi").innerText =
      lastPrediksi.toFixed(2);

    document.getElementById("totalData").innerText =
      totalData;

    document.getElementById("persentaseIKM").innerText =
      persentase.toFixed(2) + "%";

    document.getElementById("tanggalIKM").innerHTML =
      `
      Tingkat Kepuasan Masyarakat<br>
      ${tanggal}
      `;

    /* ================= GRAFIK IKM ================= */

    const labels = data.map(item => {
      const date = new Date(item["Tanggal"]);

      return date.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric"
      });
    });

    // Data aktual
    const dataAktual = data.map(item =>
      item["IKM Konversi"] !== null
        ? item["IKM Konversi"]
        : null
    );

    // Data forecast
    const dataForecast = data.map(item =>
      item["IKM Konversi"] === null
        ? item["Prediksi"]
        : null
    );

    const ctx = document
      .getElementById("ikmChart")
      .getContext("2d");

    new Chart(ctx, {

      type: "line",

      data: {

        labels: labels,

        datasets: [

          {
            label: "IKM Aktual",

            data: dataAktual,

            borderColor: "#1565c0",

            backgroundColor:
              "rgba(21,101,192,0.15)",

            borderWidth: 4,

            pointRadius: 4,

            pointHoverRadius: 7,

            fill: false,

            tension: 0.35,

            spanGaps: true
          },

          {
            label: "Forecasting 2026",

            data: dataForecast,

            borderColor: "#ff6f00",

            backgroundColor:
              "rgba(255,111,0,0.15)",

            borderDash: [10, 5],

            borderWidth: 4,

            pointRadius: 4,

            pointHoverRadius: 7,

            fill: false,

            tension: 0.35,

            spanGaps: true
          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false
        },

        plugins: {

          legend: {
            position: "top",

            labels: {
              font: {
                size: 14
              }
            }
          },

          tooltip: {

            backgroundColor: "#0d47a1",

            titleFont: {
              size: 14
            },

            bodyFont: {
              size: 13
            },

            padding: 12
          }

        },

        scales: {

          y: {

            beginAtZero: false,

            ticks: {
              font: {
                size: 12
              }
            }

          },

          x: {

            ticks: {
              font: {
                size: 11
              }
            }

          }

        }

      }

    });

  })
  .catch(error => {
    console.error("JSON Error:", error);
  });
  })