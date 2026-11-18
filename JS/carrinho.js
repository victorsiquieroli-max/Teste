document.addEventListener("DOMContentLoaded", async () => {
  // --- 1. TRANSIÇÃO DO CABEÇALHO AO ROLAR ---
  const cabecalho = document.getElementById("cabecalho-principal");
  const logoHeader = document.getElementById("header-logo");

  function checarScrollHeader() {
    if (cabecalho) {
      if (window.scrollY > 60) {
        cabecalho.classList.add("com-scroll");
        if (logoHeader) logoHeader.src = "../imgs/meunome.png";
      } else {
        cabecalho.classList.remove("com-scroll");
        if (logoHeader) logoHeader.src = "../imgs/seunome.png";
      }
    }
  }

  window.addEventListener("scroll", checarScrollHeader);
  checarScrollHeader();

  // --- 2. GARANTIR CARREGAMENTO DO PRODUTOS.JSON NO LOCALSTORAGE ---
  let dadosBanco = JSON.parse(localStorage.getItem("mare_alta_db"));
  if (!dadosBanco) {
    try {
      const response = await fetch("../produtos.json");
      const data = await response.json();
      dadosBanco = data.Mare_Alta;
      localStorage.setItem("mare_alta_db", JSON.stringify(dadosBanco));
    } catch (error) {
      console.warn("Não foi possível carregar ../produtos.json:", error);
    }
  }

  // --- 3. ESTADO DO CARRINHO E VARIÁVEL DO FRETE ---
  const cartListContainer = document.getElementById("cart-items-list");
  const selectAllCheckbox = document.getElementById("select-all");
  const totalPriceElement = document.getElementById("total-price");
  const selectedThumbsContainer = document.getElementById("selected-thumbs");

  let carrinho = JSON.parse(localStorage.getItem("mare_alta_carrinho")) || [];
  let valorFreteAtual = 0; // Guarda o valor do frete calculado

  const placeholderImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23e8e8e8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888888" font-size="11" font-family="sans-serif">Sem Imagem</text></svg>';

  function salvarCarrinho() {
    localStorage.setItem("mare_alta_carrinho", JSON.stringify(carrinho));
  }

  function ajustarCaminhoImg(caminho) {
    if (!caminho) return placeholderImage;
    if (caminho.startsWith("http") || caminho.startsWith("data:") || caminho.startsWith("../")) {
      return caminho;
    }
    return `../${caminho}`;
  }

  // --- 4. RENDERIZAR OS ITENS DO CARRINHO ---
  function renderizarCarrinho() {
    if (!cartListContainer) return;

    if (carrinho.length === 0) {
      cartListContainer.innerHTML = `
        <div class="cart-empty-state">
          <p>Seu carrinho está vazio no momento.</p>
          <a href="colecao.html" class="btn-explorar">Explorar Coleção</a>
        </div>
      `;
      updateCartSummary();
      return;
    }

    cartListContainer.innerHTML = carrinho.map((item, index) => {
      const precoFormatado = Number(item.preco).toFixed(2).replace(".", ",");
      const tamanhoAtual = item.tamanho || "M";
      const qtdAtual = Number(item.quantidade) || 1;

      const opcoesTamanho = ["P", "M", "G", "GG"].map(tam => `
        <div class="dropdown-option ${tam === tamanhoAtual ? "active" : ""}" data-value="${tam}">
          Tamanho: ${tam}
        </div>
      `).join("");

      const opcoesQtd = [1, 2, 3, 4, 5].map(num => `
        <div class="dropdown-option ${num === qtdAtual ? "active" : ""}" data-value="${num}">
          Qtd: ${num}
        </div>
      `).join("");

      return `
        <div class="cart-item-card" data-index="${index}">
          <label class="custom-checkbox">
            <input type="checkbox" class="item-checkbox" data-index="${index}" ${item.selecionado !== false ? "checked" : ""}>
            <span class="checkmark"></span>
          </label>

         <div class="item-image">
            <img src="${ajustarCaminhoImg(item.img)}" alt="${item.nome}" class="cart-product-img">
          </div>

          <div class="item-details">
            <div class="item-title-row">
              <h3 class="item-title">${item.nome} — R$ ${precoFormatado}</h3>
              <button type="button" class="btn-delete-item" data-index="${index}" title="Remover do carrinho">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>

            <div class="item-badges">
              <div class="custom-dropdown item-size-dropdown" data-index="${index}">
                <button type="button" class="dropdown-toggle">
                  <span>Tamanho: ${tamanhoAtual}</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                  ${opcoesTamanho}
                </div>
              </div>

              <div class="custom-dropdown item-qty-dropdown" data-index="${index}">
                <button type="button" class="dropdown-toggle">
                  <span>Qtd: ${qtdAtual}</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                  ${opcoesQtd}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    vincularEventosCards();
    updateCartSummary();
  }

  // --- 5. VINCULAR EVENTOS NOS CARDS GERADOS ---
  function vincularEventosCards() {
    document.querySelectorAll(".item-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const idx = Number(e.target.dataset.index);
        carrinho[idx].selecionado = e.target.checked;
        salvarCarrinho();
        recalcularFreteSePreenchido();
        updateCartSummary();
      });
    });

    document.querySelectorAll(".btn-delete-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        carrinho.splice(idx, 1);
        salvarCarrinho();
        recalcularFreteSePreenchido();
        renderizarCarrinho();
      });
    });

    document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const options = dropdown.querySelectorAll(".dropdown-option");
      const idx = Number(dropdown.dataset.index);

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".custom-dropdown").forEach((d) => {
          if (d !== dropdown) d.classList.remove("open");
        });
        dropdown.classList.toggle("open");
      });

      options.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.stopPropagation();
          options.forEach((opt) => opt.classList.remove("active"));
          option.classList.add("active");

          toggle.querySelector("span").textContent = option.textContent.trim();
          dropdown.classList.remove("open");

          const valor = option.getAttribute("data-value");
          if (dropdown.classList.contains("item-qty-dropdown")) {
            carrinho[idx].quantidade = parseInt(valor, 10);
          } else if (dropdown.classList.contains("item-size-dropdown")) {
            carrinho[idx].tamanho = valor;
          }

          salvarCarrinho();
          recalcularFreteSePreenchido();
          updateCartSummary();
        });
      });
    });
  }

  // --- 6. ATUALIZAR RESUMO, MINIATURAS E SOMAR O FRETE ---
  function updateCartSummary() {
    let subtotal = 0;
    if (selectedThumbsContainer) selectedThumbsContainer.innerHTML = "";

    carrinho.forEach((item) => {
      if (item.selecionado !== false) {
        const price = Number(item.preco) || 0;
        const quantity = Number(item.quantidade) || 1;
        const size = item.tamanho || "M";

        subtotal += price * quantity;

        if (selectedThumbsContainer) {
          const wrapper = document.createElement("div");
          wrapper.className = "thumb-wrapper";

          const thumb = document.createElement("img");
          thumb.src = ajustarCaminhoImg(item.img);
          thumb.alt = item.nome;
          thumb.addEventListener("error", function () {
            this.onerror = null;
            this.src = placeholderImage;
          });

          wrapper.appendChild(thumb);

          const sizeBadge = document.createElement("span");
          sizeBadge.className = "thumb-badge thumb-badge-size";
          sizeBadge.textContent = size;
          wrapper.appendChild(sizeBadge);

          if (quantity > 1) {
            const qtyBadge = document.createElement("span");
            qtyBadge.className = "thumb-badge thumb-badge-qty";
            qtyBadge.textContent = quantity;
            wrapper.appendChild(qtyBadge);
          }

          selectedThumbsContainer.appendChild(wrapper);
        }
      }
    });

    // Soma o subtotal das peças + valorFreteAtual (se houver itens selecionados)
    const totalFinal = subtotal > 0 ? subtotal + valorFreteAtual : 0;

    if (totalPriceElement) {
      totalPriceElement.textContent = `R$ ${totalFinal.toFixed(2).replace(".", ",")}`;
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.checked = carrinho.length > 0 && carrinho.every((item) => item.selecionado !== false);
    }
  }

  // --- 7. CÁLCULO DE FRETE COM JQUERY + DADOS DO PERFIL ---
  function obterSubtotalSelecionado() {
    return carrinho.reduce((acc, item) => {
      return item.selecionado !== false
        ? acc + (Number(item.preco) || 0) * (Number(item.quantidade) || 1)
        : acc;
    }, 0);
  }

  function calcularFretePorCep(cepDigitado) {
    if (typeof $ === "undefined") return;

    const cepLimpo = (cepDigitado || "").replace(/\D/g, "");
    const $resultado = $("#frete-resultado");
    const subtotalItens = obterSubtotalSelecionado();

    if (cepLimpo.length !== 8) {
      valorFreteAtual = 0;
      $resultado.text("Digite um CEP válido com 8 números.").css("color", "#b91c1c");
      updateCartSummary();
      return;
    }

    $resultado.text("Calculando frete...").css("color", "#475569");

    $.getJSON(`https://viacep.com.br/ws/${cepLimpo}/json/`, function (dados) {
      if (dados.erro) {
        valorFreteAtual = 0;
        $resultado.text("CEP não encontrado.").css("color", "#b91c1c");
        updateCartSummary();
        return;
      }

      const uf = dados.uf;
      let prazo = "5 a 10 dias úteis";

      if (subtotalItens >= 299) {
        valorFreteAtual = 0;
        prazo = uf === "MG" ? "2 a 4 dias úteis" : "4 a 8 dias úteis";
        $resultado
          .html(`<strong>Frete Grátis</strong> para ${dados.localidade}/${uf} (${prazo})`)
          .css("color", "#15803d");
      } else {
        if (uf === "MG") {
          valorFreteAtual = 15.90;
          prazo = "2 a 4 dias úteis";
        } else if (["SP", "RJ", "ES"].includes(uf)) {
          valorFreteAtual = 22.90;
          prazo = "3 a 6 dias úteis";
        } else {
          valorFreteAtual = 34.90;
          prazo = "5 a 10 dias úteis";
        }

        const freteFormatado = valorFreteAtual.toFixed(2).replace(".", ",");
        $resultado
          .html(`Entrega para ${dados.localidade}/${uf}: <strong>R$ ${freteFormatado}</strong> (${prazo})`)
          .css("color", "#0f172a");
      }

      updateCartSummary();
    }).fail(function () {
      $resultado.text("Erro ao consultar CEP. Tente novamente.").css("color", "#b91c1c");
    });
  }

  function recalcularFreteSePreenchido() {
    if (typeof $ !== "undefined") {
      const cepAtual = $("#cep-carrinho").val();
      if (cepAtual && cepAtual.replace(/\D/g, "").length === 8) {
        calcularFretePorCep(cepAtual);
      }
    }
  }

  // Inicialização dos eventos jQuery do Frete
  if (typeof $ !== "undefined") {
    $("#cep-carrinho").on("input", function () {
      let v = $(this).val().replace(/\D/g, "");
      if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
      $(this).val(v);
    });

    $("#btn-calcular-frete").on("click", function () {
      calcularFretePorCep($("#cep-carrinho").val());
    });

    const usuarioPerfil = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioPerfil && usuarioPerfil.cep) {
      $("#cep-carrinho").val(usuarioPerfil.cep);
      calcularFretePorCep(usuarioPerfil.cep);
    }
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      carrinho.forEach((item) => {
        item.selecionado = e.target.checked;
      });
      salvarCarrinho();
      recalcularFreteSePreenchido();
      renderizarCarrinho();
    });
  }

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-dropdown").forEach((d) => {
      d.classList.remove("open");
    });
  });

  renderizarCarrinho();
});
