document.addEventListener("DOMContentLoaded", () => {
    const estaNaPastaHTML = window.location.pathname.includes("/HTML/");
    const caminhoPerfil = estaNaPastaHTML ? "perfil.html" : "HTML/perfil.html";
  
    if (!document.getElementById("modal-auth")) {
      const styleModal = document.createElement("style");
      styleModal.textContent = `
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background-color: rgba(0, 0, 0, 0.55); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease; padding: 20px;
        }
        .modal-overlay.ativo { opacity: 1; pointer-events: auto; }
        .modal-card {
          background-color: #F8F3EA; width: 100%; max-width: 420px; max-height: 90vh;
          overflow-y: auto; border-radius: 32px; padding: 35px 30px; position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3); transform: scale(0.9);
          transition: transform 0.3s ease; color: #333333; font-family: 'Montserrat', sans-serif;
        }
        .modal-overlay.ativo .modal-card { transform: scale(1); }
        .modal-fechar {
          position: absolute; top: 18px; right: 22px; background: transparent;
          border: none; font-size: 26px; color: #777; cursor: pointer; line-height: 1;
        }
        .modal-fechar:hover { color: #111; }
        .modal-abas {
          display: flex; background-color: #E6DFD4; border-radius: 50px;
          padding: 4px; margin-bottom: 25px; margin-top: 10px;
        }
        .aba-btn {
          flex: 1; background: transparent; border: none; padding: 10px 0;
          border-radius: 50px; font-size: 14px; font-weight: 500; color: #7A756C; cursor: pointer;
        }
        .aba-btn.ativo {
          background-color: #FFFFFF; color: #0A436C; font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .conteudo-aba { display: none; }
        .conteudo-aba.ativo { display: block; }
        .cabecalho-modal h2 { font-size: 20px; font-weight: 600; color: #111111; margin-bottom: 4px; }
        .cabecalho-modal p { font-size: 13px; color: #777777; margin-bottom: 22px; }
        .form-modal { display: flex; flex-direction: column; gap: 14px; }
        .campo-modal { display: flex; flex-direction: column; gap: 5px; }
        .campo-modal label { font-size: 12px; font-weight: 500; color: #444444; margin-left: 4px; }
        .campo-modal input {
          width: 100%; background-color: #FFFFFF; border: 1px solid #E1D9CD;
          border-radius: 50px; padding: 12px 18px; font-size: 14px; color: #222222; outline: none;
        }
        .campo-modal input:focus { border-color: #0A436C; box-shadow: 0 0 0 3px rgba(10, 67, 108, 0.1); }
        .campo-modal input.input-erro { border-color: #fa2e2a !important; }
        .input-com-icone { position: relative; display: flex; align-items: center; }
        .input-com-icone input { padding-right: 48px; }
        .btn-toggle-senha {
          position: absolute; right: 14px; background: transparent; border: none;
          cursor: pointer; color: #777777; display: flex; align-items: center; width: 20px; height: 20px;
        }
        .btn-toggle-senha svg { width: 18px; height: 18px; pointer-events: none; }
        .btn-toggle-senha .icone-olho-fechado { display: none; }
        .btn-toggle-senha.senha-visivel .icone-olho { display: none; }
        .btn-toggle-senha.senha-visivel .icone-olho-fechado { display: block; }
        .link-esqueci-senha { text-align: right; margin-top: -4px; }
        .link-esqueci-senha a, .rodape-modal-link a { font-size: 12px; color: #0A436C; text-decoration: none; font-weight: 600; }
        .rodape-modal-link { text-align: center; margin-top: 16px; }
        .btn-modal-submit {
          width: 100%; background-color: #0A436C; color: #FFFFFF; border: none;
          border-radius: 50px; padding: 13px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px;
        }
        .btn-modal-submit:hover { background-color: #073150; }
        .btn-modal-submit.tremer { background-color: #A83232 !important; }
        .toast-global-auth {
          position: fixed; top: 30px; right: 30px; background-color: #0A436C; color: #fff;
          padding: 15px 25px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 100000; transform: translateY(-120px); opacity: 0; transition: all 0.4s ease;
          border: 1px solid #178195; font-family: 'Montserrat', sans-serif; font-size: 14px;
        }
        .toast-global-auth.ativo { transform: translateY(0); opacity: 1; }
      `;
      document.head.appendChild(styleModal);
  
      const modalHTML = `
        <div id="modal-auth" class="modal-overlay" aria-hidden="true">
          <div class="modal-card">
            <button type="button" class="modal-fechar" id="fechar-modal" aria-label="Fechar">×</button>
            <div class="modal-abas" id="container-abas">
              <button type="button" class="aba-btn ativo" data-tab="login">Entrar</button>
              <button type="button" class="aba-btn" data-tab="cadastro">Cadastrar</button>
            </div>
  
            <div class="conteudo-aba ativo" id="tab-login">
              <div class="cabecalho-modal">
                <h2>Bem-vinda de volta</h2>
                <p>Entre para continuar explorando a coleção</p>
              </div>
              <form class="form-modal" id="form-login" novalidate>
                <div class="campo-modal">
                  <label for="login-email">E-mail</label>
                  <input type="email" id="login-email" required>
                </div>
                <div class="campo-modal">
                  <label for="login-senha">Senha</label>
                  <div class="input-com-icone">
                    <input type="password" id="login-senha" required>
                    <button type="button" class="btn-toggle-senha" aria-label="Mostrar senha">
                      <svg class="icone-olho" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg class="icone-olho-fechado" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="link-esqueci-senha"><a href="#" id="link-ir-recuperar">Esqueceu a senha?</a></div>
                <button type="submit" class="btn-modal-submit" id="btn-login-submit">Entrar</button>
              </form>
            </div>
  
            <div class="conteudo-aba" id="tab-cadastro">
              <div class="cabecalho-modal">
                <h2>Crie sua conta</h2>
                <p>Junte-se à comunidade Maré Alta</p>
              </div>
              <form class="form-modal" id="form-cadastro" novalidate>
                <div class="campo-modal"><label for="cad-nome">Nome completo</label><input type="text" id="cad-nome" required></div>
                <div class="campo-modal"><label for="cad-email">E-mail</label><input type="email" id="cad-email" required></div>
                <div class="campo-modal"><label for="cad-celular">Celular</label><input type="tel" id="cad-celular" placeholder="(00) 00000-0000"></div>
                <div class="campo-modal">
                  <label for="cad-senha">Senha</label>
                  <div class="input-com-icone">
                    <input type="password" id="cad-senha" required>
                    <button type="button" class="btn-toggle-senha"><svg class="icone-olho" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg class="icone-olho-fechado" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button>
                  </div>
                </div>
                <div class="campo-modal">
                  <label for="cad-confirmar">Confirmar Senha</label>
                  <div class="input-com-icone">
                    <input type="password" id="cad-confirmar" required>
                    <button type="button" class="btn-toggle-senha"><svg class="icone-olho" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg class="icone-olho-fechado" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button>
                  </div>
                </div>
                <button type="submit" class="btn-modal-submit" id="btn-cadastro-submit">Criar conta</button>
              </form>
            </div>
  
            <div class="conteudo-aba" id="tab-recuperar">
              <div class="cabecalho-modal">
                <h2>Recuperar senha</h2>
                <p>Digite seu e-mail para receber as instruções</p>
              </div>
              <form class="form-modal" id="form-recuperar">
                <div class="campo-modal"><label for="rec-email">E-mail cadastrado</label><input type="email" id="rec-email" required></div>
                <button type="submit" class="btn-modal-submit">Enviar link</button>
              </form>
              <div class="rodape-modal-link"><a href="#" id="link-voltar-login">← Voltar para o login</a></div>
            </div>
          </div>
        </div>
        <div id="toast-global-auth" class="toast-global-auth"></div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }
  
    function atualizarHeaderGlobal() {
      const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
      const botoesEntrar = document.querySelectorAll("#btn-entrar-nav, .botao-entrar, .btn-entrar");
      let btnPerfilExistente = document.getElementById("btn-perfil-nav");
  
      if (usuarioLogado) {
        const fotoUrl =
          usuarioLogado.foto ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioLogado.nome)}&background=178195&color=fff`;
  
        botoesEntrar.forEach((btn) => (btn.style.display = "none"));
  
        if (btnPerfilExistente) {
          btnPerfilExistente.style.display = "flex";
          btnPerfilExistente.href = caminhoPerfil;
          const img = btnPerfilExistente.querySelector("img");
          if (img) img.src = fotoUrl;
        } else {
          const containerAcoes = document.querySelector(".header-actions, .acoes-navegacao, .header-icons");
          if (containerAcoes) {
            const linkPerfil = document.createElement("a");
            linkPerfil.href = caminhoPerfil;
            linkPerfil.id = "btn-perfil-nav";
            linkPerfil.title = `Perfil de ${usuarioLogado.nome}`;
            linkPerfil.style.cssText = "display:flex;align-items:center;justify-content:center;text-decoration:none;";
  
            const imgPerfil = document.createElement("img");
            imgPerfil.src = fotoUrl;
            imgPerfil.alt = usuarioLogado.nome;
            imgPerfil.style.cssText = "width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #178195;";
  
            linkPerfil.appendChild(imgPerfil);
            containerAcoes.insertBefore(linkPerfil, containerAcoes.firstChild);
          }
        }
      }
    }
  
    atualizarHeaderGlobal();
  
    const modalAuth = document.getElementById("modal-auth");
    const abasNav = document.getElementById("container-abas");
    const botoesAba = document.querySelectorAll(".aba-btn");
    const conteudosAba = document.querySelectorAll(".conteudo-aba");
  
    function trocarAba(nomeAba) {
      if (abasNav) abasNav.style.display = nomeAba === "recuperar" ? "none" : "flex";
      botoesAba.forEach((btn) => btn.classList.toggle("ativo", btn.dataset.tab === nomeAba));
      conteudosAba.forEach((c) => c.classList.toggle("ativo", c.id === `tab-${nomeAba}`));
    }
  
    function abrirModal(aba = "login") {
      if (!modalAuth) return;
      modalAuth.classList.add("ativo");
      document.body.style.overflow = "hidden";
      trocarAba(aba);
    }
  
    function fecharModal() {
      if (!modalAuth) return;
      modalAuth.classList.remove("ativo");
      document.body.style.overflow = "";
    }
  
    function notificarGlobal(msg) {
      const toast = document.getElementById("toast-global-auth") || document.getElementById("toast-sucesso");
      if (!toast) return;
      const span = toast.querySelector("span");
      if (span) span.textContent = msg;
      else toast.textContent = msg;
      toast.classList.add("ativo");
      setTimeout(() => toast.classList.remove("ativo"), 3200);
    }
  
    document.addEventListener("click", (e) => {
      const btnEntrar = e.target.closest("#btn-entrar-nav, .botao-entrar, .btn-entrar, [href='#login']");
      if (btnEntrar) {
        e.preventDefault();
        abrirModal("login");
      }
  
      const toggleSenha = e.target.closest(".btn-toggle-senha");
      if (toggleSenha) {
        e.preventDefault();
        const input = toggleSenha.closest(".input-com-icone")?.querySelector("input");
        if (input) {
          const isPass = input.type === "password";
          input.type = isPass ? "text" : "password";
          toggleSenha.classList.toggle("senha-visivel", isPass);
        }
      }
    });
  
    document.getElementById("fechar-modal")?.addEventListener("click", fecharModal);
    modalAuth?.addEventListener("click", (e) => { if (e.target === modalAuth) fecharModal(); });
    botoesAba.forEach((btn) => btn.addEventListener("click", () => trocarAba(btn.dataset.tab)));
    document.getElementById("link-ir-recuperar")?.addEventListener("click", (e) => { e.preventDefault(); trocarAba("recuperar"); });
    document.getElementById("link-voltar-login")?.addEventListener("click", (e) => { e.preventDefault(); trocarAba("login"); });
  
    const formLogin = document.getElementById("form-login");
    if (formLogin && !formLogin.dataset.boundGlobal) {
      formLogin.dataset.boundGlobal = "true";
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const senha = document.getElementById("login-senha").value;
  
        const CREDENCIAIS = {
          cliente: { email: "cliente@marealta.com", senha: "Cliente123", nome: "Marina Silva" },
          admin: { email: "admin@marealta.com", senha: "Admin123", nome: "Administrador Maré Alta" }
        };
  
        let user = null;
        if (email === CREDENCIAIS.admin.email && senha === CREDENCIAIS.admin.senha) {
          user = {
            nome: CREDENCIAIS.admin.nome,
            email: CREDENCIAIS.admin.email,
            tipo: "admin",
            telefone: "(34) 99812-3711",
            cep: "38400-100",
            cidade: "Uberlândia - MG",
            foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
          };
          sessionStorage.setItem("tipoUsuario", "admin");
        } else if (email === CREDENCIAIS.cliente.email && senha === CREDENCIAIS.cliente.senha) {
          const db = JSON.parse(localStorage.getItem("mare_alta_db"));
          const cliDb = db && db.Cliente ? db.Cliente.find((c) => c.email_cli === email) : null;
          user = {
            nome: cliDb ? cliDb.nome_cli : CREDENCIAIS.cliente.nome,
            email: CREDENCIAIS.cliente.email,
            tipo: "cliente",
            telefone: cliDb ? cliDb.telefone_cli : "(34) 99812-3711",
            cep: cliDb ? cliDb.cep_cli : "38400-100",
            cidade: cliDb ? cliDb.cidade_cli : "Uberlândia - MG",
            foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
          };
          sessionStorage.setItem("tipoUsuario", "cliente");
        }
  
        if (user) {
          localStorage.setItem("usuarioLogado", JSON.stringify(user));
          fecharModal();
          atualizarHeaderGlobal();
          notificarGlobal(`Bem-vinda(o), ${user.nome.split(" ")[0]}!`);

          if (window.location.pathname.includes("carrinho.html")) {
            setTimeout(() => window.location.reload(), 600);
          }
        } else {
          const btn = document.getElementById("btn-login-submit");
          btn?.classList.add("tremer");
          setTimeout(() => btn?.classList.remove("tremer"), 450);
        }
      });
    }
  });