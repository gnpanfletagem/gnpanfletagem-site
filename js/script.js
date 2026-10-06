/*
 * GN Panfletagem - JavaScript V2
 *
 * Para ativar Google Analytics 4:
 * substitua o valor abaixo pelo seu ID, por exemplo: G-ABC123DEF4
 * Enquanto estiver vazio, o site funciona normalmente e o dataLayer
 * continua preparado para receber eventos futuramente.
 */
const GN_GA4_ID = "";

function loadGA4() {
    if (!GN_GA4_ID || !/^G-[A-Z0-9]+$/i.test(GN_GA4_ID)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GN_GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GN_GA4_ID);
}

function trackEvent(eventName, params = {}) {
    window.dataLayer = window.dataLayer || [];
    const payload = {
        event: eventName,
        page_path: window.location.pathname,
        page_title: document.title,
        ...params
    };

    window.dataLayer.push(payload);

    if (typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
    }
}

function captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
    const current = {};

    keys.forEach(key => {
        const value = params.get(key);
        if (value) current[key] = value;
    });

    if (Object.keys(current).length) {
        localStorage.setItem("gn_attribution", JSON.stringify(current));
    }
}

function getAttributionText() {
    try {
        const data = JSON.parse(localStorage.getItem("gn_attribution") || "{}");
        const entries = Object.entries(data);
        if (!entries.length) return "";
        return "\n\nOrigem do acesso:\n" + entries.map(([k,v]) => `${k}: ${v}`).join("\n");
    } catch {
        return "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadGA4();
    captureAttribution();

    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            hamburger.setAttribute("aria-expanded", String(isOpen));
        });

        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });
    }

    const year = document.getElementById("currentYear");
    if (year) year.textContent = new Date().getFullYear();

    document.querySelectorAll("[data-track]").forEach(el => {
        el.addEventListener("click", () => {
            trackEvent("cta_click", {
                cta_name: el.dataset.track || "unknown",
                destination: el.getAttribute("href") || ""
            });
        });
    });

    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
        quoteForm.addEventListener("submit", function(event){
            event.preventDefault();

            const nome = document.getElementById("nome")?.value.trim() || "";
            const empresa = document.getElementById("empresa")?.value.trim() || "Não informado";
            const quantidade = document.getElementById("quantidade")?.value.trim() || "A definir";
            const regiao = document.getElementById("regiao")?.value.trim() || "A definir";
            const tipo = document.getElementById("tipo")?.value || "A definir";
            const data = document.getElementById("data")?.value || "A definir";
            const observacoes = document.getElementById("observacoes")?.value.trim() || "Nenhuma";

            const mensagem = [
                "Olá! Gostaria de solicitar um orçamento com a GN Panfletagem.",
                "",
                `Nome: ${nome}`,
                `Empresa: ${empresa}`,
                `Quantidade aproximada: ${quantidade}`,
                `Cidade / região: ${regiao}`,
                `Tipo de distribuição: ${tipo}`,
                `Data prevista: ${data}`,
                `Observações: ${observacoes}`
            ].join("\n") + getAttributionText();

            trackEvent("generate_lead_whatsapp", {
                form_name: "orcamento_site",
                city_region: regiao,
                distribution_type: tipo
            });

            const url = "https://wa.me/5541984410350?text=" + encodeURIComponent(mensagem);
            window.open(url, "_blank", "noopener");
        });
    }
});
